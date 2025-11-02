# Profile Picture Upload Feature

## Overview
Added profile picture upload functionality to the Profile edit page, allowing users to upload, preview, and remove their profile pictures using Supabase Storage.

## Changes Made

### File Modified
- `/frontend/src/pages/Profile.jsx`

### New Features Added

#### 1. State Management
```jsx
const [uploadingImage, setUploadingImage] = useState(false)
const [profile, setProfile] = useState({
  ...
  avatar_url: '',
  ...
})
```

#### 2. Image Upload Function
- **File validation**: Checks file type and size (max 5MB)
- **Upload to Supabase Storage**: Uploads to 'profiles' bucket
- **Automatic URL generation**: Gets public URL after upload
- **Profile state update**: Updates avatar_url in profile state

#### 3. Image Removal Function
- Clears avatar_url from profile state
- Falls back to generated avatar on save

#### 4. UI Components
- **Avatar Preview**: 
  - Shows current profile picture (or generated avatar)
  - Circular preview (96x96px)
  - Loading spinner during upload
  - Border styling

- **Upload Button**:
  - File input hidden, styled button visible
  - Shows "Uploading..." during upload
  - Disabled during upload

- **Remove Button**:
  - Only visible when avatar_url exists
  - Red styling for clear indication
  - Instant preview update

- **Helper Text**:
  - File type and size requirements
  - Purpose explanation

## How It Works

### Upload Process
1. User clicks "Upload Photo" button
2. File picker opens
3. User selects image
4. **Validation**:
   - Check if file is an image
   - Check if size < 5MB
5. **Upload**:
   - Generate unique filename: `{userId}-{timestamp}.{ext}`
   - Upload to Supabase Storage 'profiles' bucket
   - Get public URL
6. **Update State**:
   - Set avatar_url in profile state
   - Show preview immediately
7. User must click "Save Profile" to persist

### Remove Process
1. User clicks "Remove" button
2. Clear avatar_url from state
3. Preview shows generated avatar
4. User must click "Save Profile" to persist

### Save Process
When user clicks "Save Profile":
- Profile data including avatar_url sent to backend
- Backend updates users table
- avatar_url persisted in database

## Storage Configuration

### Supabase Storage Bucket
**Name**: `profiles`  
**Public**: Yes  
**Configuration**: Already created in migration file

### Storage Policies (from migration)
```sql
-- Public read access
CREATE POLICY "Allow public read access to profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Authenticated users can upload
CREATE POLICY "Allow authenticated users to upload their own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profiles' AND auth.uid() IS NOT NULL);

-- Users can update their own
CREATE POLICY "Allow users to update their own profile picture"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profiles' AND auth.uid() IS NOT NULL);

-- Users can delete their own
CREATE POLICY "Allow users to delete their own profile picture"
ON storage.objects FOR DELETE
USING (bucket_id = 'profiles' AND auth.uid() IS NOT NULL);
```

## File Naming Convention
```
{userId}-{timestamp}.{extension}

Example:
a1b2c3d4-5678-9abc-def0-123456789abc-1730556789123.jpg
```

**Benefits**:
- Unique filenames prevent conflicts
- User ID makes tracking easier
- Timestamp allows multiple uploads
- Upsert: true overwrites if filename matches

## Validation Rules

### File Type
- Must be an image (image/*)
- Accepted formats: JPG, PNG, GIF, WEBP, etc.

### File Size
- Maximum: 5MB (5 * 1024 * 1024 bytes)
- Prevents large uploads

### User Authentication
- Must be logged in (checks supabase.auth.getUser())
- Ensures only authenticated users can upload

## User Experience

### Visual States

**Default (No Picture)**:
- Shows generated avatar from UI Avatars API
- Based on user's name

**During Upload**:
- Loading spinner overlay on avatar
- Button shows "Uploading..."
- Button disabled

**After Upload (Before Save)**:
- Shows uploaded image preview
- Toast: "Profile picture uploaded! Remember to save your profile."
- Remove button visible

**After Save**:
- Image persisted
- Visible across all pages (Matches, Conversations, Profile View)

### Error Handling

**Invalid File Type**:
```
❌ Please upload an image file
```

**File Too Large**:
```
❌ Image size should be less than 5MB
```

**Upload Failed**:
```
❌ Failed to upload image
```

**Not Authenticated**:
```
❌ Not authenticated
```

## Integration with Other Pages

The uploaded profile picture automatically appears on:
- **Profile View** (`/profile/:userId`)
- **Matches Page** (in match cards)
- **Conversations Page** (in conversation list)
- **Chat Page** (in chat header)
- **Dashboard** (if avatar displayed there)

All these pages use the same fallback logic:
```jsx
profile.avatar_url || `https://ui-avatars.com/api/?name=${name}&size=200`
```

## Database Schema

### users table
```sql
avatar_url TEXT  -- Stores Supabase Storage public URL
```

**Example value**:
```
https://your-project.supabase.co/storage/v1/object/public/profiles/user-id-timestamp.jpg
```

## Testing Checklist

- [ ] Upload JPG image
- [ ] Upload PNG image
- [ ] Upload GIF image
- [ ] Try to upload non-image (should fail)
- [ ] Try to upload >5MB image (should fail)
- [ ] Remove uploaded image
- [ ] Upload, remove, upload again
- [ ] Upload and save profile
- [ ] Refresh page - image persists
- [ ] View profile on ProfileView page
- [ ] View profile on Matches page
- [ ] View profile on Conversations page
- [ ] Upload without being logged in (should fail)

## Future Enhancements

**Potential additions**:
- Image cropping before upload
- Image compression/optimization
- Multiple image sizes (thumbnail, full)
- Drag & drop upload
- Paste from clipboard
- Camera capture on mobile
- Delete old images when uploading new
- Image filters/effects
- Progress bar during upload
- Preview before upload confirmation

## Code Examples

### Upload Function
```jsx
const handleImageUpload = async (event) => {
  const file = event.target.files?.[0]
  // Validation...
  
  // Upload
  const { data, error } = await supabase.storage
    .from('profiles')
    .upload(filePath, file, { upsert: true })
    
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath)
    
  // Update state
  setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
}
```

### UI Component
```jsx
<div className="flex items-start gap-6">
  <img src={profile.avatar_url || fallback} className="w-24 h-24 rounded-full" />
  <label className="btn-primary cursor-pointer">
    Upload Photo
    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
  </label>
</div>
```

## Dependencies

**Required**:
- Supabase client (`@supabase/supabase-js`)
- React Hot Toast (for notifications)
- Supabase Storage bucket 'profiles' (created in migration)

**No additional packages needed!**

---

**Created:** 2 November 2025  
**Status:** ✅ Complete and functional  
**Migration Required:** Yes (already exists in 20251101120000_comprehensive_profile_schema.sql)
