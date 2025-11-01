-- Add profile customization fields
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS favorite_ice_cream TEXT,
  ADD COLUMN IF NOT EXISTS spirit_animal TEXT,
  ADD COLUMN IF NOT EXISTS personality_type TEXT CHECK (personality_type IN ('introvert', 'extrovert')),
  ADD COLUMN IF NOT EXISTS daily_rhythm TEXT CHECK (daily_rhythm IN ('early_bird', 'night_owl')),
  ADD COLUMN IF NOT EXISTS personal_color TEXT;

-- Create storage for profile pictures
CREATE POLICY "Allow public read access to profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Allow authenticated users to upload their own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles' AND
  auth.uid()::text = (regexp_match(name, '^profile-pictures/(.*)-.*'))[1]
);

CREATE POLICY "Allow users to update their own profile picture"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'profiles' AND
  auth.uid()::text = (regexp_match(name, '^profile-pictures/(.*)-.*'))[1]
);

CREATE POLICY "Allow users to delete their own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles' AND
  auth.uid()::text = (regexp_match(name, '^profile-pictures/(.*)-.*'))[1]
);

-- Ensure proper ordering of profile pictures (keep only latest)
CREATE OR REPLACE FUNCTION delete_old_profile_picture()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old profile picture if it exists
  IF OLD.profile_picture_url IS NOT NULL AND OLD.profile_picture_url != NEW.profile_picture_url THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'profiles' AND name = OLD.profile_picture_url;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_old_profile_picture
BEFORE UPDATE ON users
FOR EACH ROW
WHEN (OLD.profile_picture_url IS DISTINCT FROM NEW.profile_picture_url)
EXECUTE FUNCTION delete_old_profile_picture();