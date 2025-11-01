# Profile System Setup Guide

## Database Schema Updates

The profile system adds several new fields to enhance user profiles:
- Profile picture storage
- Personality traits
- Personal preferences
- Custom validations

## Setup Steps

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to Storage
3. Click "Create new bucket"
4. Enter the following details:
   - Name: `profiles`
   - Public bucket: ☑️ (checked)
   - File size limit: 5MB (recommended)

### 2. Apply Database Migrations

1. Navigate to the SQL Editor in your Supabase Dashboard
2. Copy and paste the contents of:
   `supabase/migrations/20251101010000_add_profile_customization.sql`
3. Run the SQL commands

### 3. Storage Policies

The migration automatically creates four storage policies:
1. Public read access for profile pictures
2. Authenticated users can upload their own pictures
3. Users can update their own pictures
4. Users can delete their own pictures

### 4. Environment Variables

Ensure your frontend .env.local has the storage configuration:
```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Testing Profile Updates

1. Create a new user account
2. Navigate to the profile page
3. Upload a profile picture
4. Fill in the personality details
5. Submit the form
6. Verify that:
   - Picture uploads successfully
   - Profile details are saved
   - Old profile pictures are cleaned up automatically

## Schema Details

New columns added to the users table:
- `profile_picture_url`: TEXT - stores the path to the profile picture
- `favorite_ice_cream`: TEXT - user's favorite ice cream flavor
- `spirit_animal`: TEXT - user's spirit animal choice
- `personality_type`: TEXT - 'introvert' or 'extrovert'
- `daily_rhythm`: TEXT - 'early_bird' or 'night_owl'
- `personal_color`: TEXT - user's color association

## Storage Structure

Profile pictures are stored in:
`profiles/profile-pictures/[user-id]-[random].extension`

## Security Features

1. **Access Control**
   - Only authenticated users can upload pictures
   - Users can only modify their own pictures
   - Public read access for profile pictures

2. **Automatic Cleanup**
   - Old profile pictures are automatically deleted when updated
   - Prevents storage bloat
   - Maintains one picture per user

## Troubleshooting

1. **Storage Issues**
   - Check bucket permissions
   - Verify file size limits
   - Ensure proper file extensions

2. **Database Issues**
   - Check migration logs
   - Verify column constraints
   - Test with sample data

3. **Profile Updates**
   - Check browser console for errors
   - Verify Supabase client configuration
   - Test file upload limits