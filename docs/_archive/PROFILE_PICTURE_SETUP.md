# Profile Picture Upload - Quick Setup

## Prerequisites Check

Before using the profile picture upload feature, ensure:

### 1. Storage Bucket Exists
The migration `20251101120000_comprehensive_profile_schema.sql` creates the storage bucket and policies.

**Check if migration was run:**
1. Go to Supabase Dashboard
2. Navigate to Storage
3. Look for bucket named `profiles`

**If bucket doesn't exist**, run this SQL in Supabase SQL Editor:

```sql
-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile pictures
CREATE POLICY "Allow public read access to profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Allow authenticated users to upload their own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow users to update their own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow users to delete their own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles' AND
  auth.uid() IS NOT NULL
);
```

### 2. Supabase Client Configuration
Ensure your frontend has the Supabase client configured:

**File:** `/frontend/.env` or `/frontend/.env.local`
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**File:** `/frontend/src/lib/supabase.js`
```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Testing the Feature

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Login
1. Navigate to http://localhost:5173
2. Login with your account

### Step 3: Go to Profile
1. Click "Profile" in navigation
2. You should see the profile edit page

### Step 4: Test Upload
1. Look for "Profile Picture" section (below Name field)
2. You should see:
   - Current avatar (generated or uploaded)
   - "Upload Photo" button
   - "Remove" button (if picture exists)

3. Click "Upload Photo"
4. Select an image (JPG, PNG, or GIF < 5MB)
5. Wait for upload (should show loading spinner)
6. See preview update
7. Click "Save Profile" to persist

### Step 5: Verify
1. Refresh the page - picture should persist
2. Go to `/profile/your-user-id` - see profile view
3. Go to Matches page - see picture in cards
4. Go to Conversations - see picture in list

## Troubleshooting

### Error: "Failed to upload image"

**Possible causes:**
1. Storage bucket doesn't exist
2. Storage policies not configured
3. Not authenticated
4. Network error

**Fix:**
1. Check Supabase Dashboard → Storage
2. Verify `profiles` bucket exists
3. Check browser console for detailed error
4. Verify you're logged in

### Error: "Please upload an image file"

**Cause:** Trying to upload non-image file

**Fix:** Select JPG, PNG, GIF, or WEBP file

### Error: "Image size should be less than 5MB"

**Cause:** File too large

**Fix:** Resize or compress image before upload

### Image doesn't appear after upload

**Possible causes:**
1. Didn't click "Save Profile"
2. Network error during save
3. Backend not updating avatar_url

**Fix:**
1. Upload image
2. Click "Save Profile" button
3. Check network tab for errors
4. Check backend logs

### Storage bucket permission denied

**Cause:** RLS policies not configured correctly

**Fix:** Run the storage policies SQL above

## Verification Checklist

- [ ] Storage bucket `profiles` exists
- [ ] Storage bucket is public
- [ ] Storage policies are created
- [ ] Supabase client configured in frontend
- [ ] Can see "Upload Photo" button on profile page
- [ ] Can upload JPG image successfully
- [ ] Preview updates immediately
- [ ] Image persists after "Save Profile"
- [ ] Image appears on profile view page
- [ ] Image appears on matches page
- [ ] Can remove image and re-upload

## Quick Test SQL

**Check if bucket exists:**
```sql
SELECT * FROM storage.buckets WHERE id = 'profiles';
```

**Check if policies exist:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

**Check users table has avatar_url:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar_url';
```

---

**Setup Time:** ~5 minutes  
**Status:** Ready to use after verification ✅
