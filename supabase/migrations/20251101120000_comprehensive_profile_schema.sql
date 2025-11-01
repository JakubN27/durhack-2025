-- Comprehensive User Profile Schema Update
-- Created: 1 November 2025
-- Description: Ensures all profile fields match the API requirements

-- Add missing avatar_url column if it doesn't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Ensure all personality fields exist (idempotent)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS favorite_ice_cream TEXT,
  ADD COLUMN IF NOT EXISTS spirit_animal TEXT,
  ADD COLUMN IF NOT EXISTS personal_color TEXT;

-- Add personality_type with proper constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='personality_type') THEN
    ALTER TABLE users ADD COLUMN personality_type TEXT DEFAULT 'introvert';
  END IF;
END $$;

-- Add daily_rhythm with proper constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='daily_rhythm') THEN
    ALTER TABLE users ADD COLUMN daily_rhythm TEXT DEFAULT 'early_bird';
  END IF;
END $$;

-- Drop existing constraints if they exist and recreate them
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_personality_type_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_daily_rhythm_check;

-- Add constraints
ALTER TABLE users 
  ADD CONSTRAINT users_personality_type_check 
  CHECK (personality_type IN ('introvert', 'extrovert'));

ALTER TABLE users 
  ADD CONSTRAINT users_daily_rhythm_check 
  CHECK (daily_rhythm IN ('early_bird', 'night_owl'));

-- Add helpful comments
COMMENT ON COLUMN users.avatar_url IS 'URL to user profile picture';
COMMENT ON COLUMN users.favorite_ice_cream IS 'User''s favorite ice cream flavor';
COMMENT ON COLUMN users.spirit_animal IS 'User''s spirit animal';
COMMENT ON COLUMN users.personality_type IS 'Whether user is introvert or extrovert';
COMMENT ON COLUMN users.daily_rhythm IS 'Whether user is early bird or night owl';
COMMENT ON COLUMN users.personal_color IS 'Color that represents the user';

-- Create storage bucket for profile pictures if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile pictures
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow public read access to profile pictures" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to upload their own profile picture" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to update their own profile picture" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to delete their own profile picture" ON storage.objects;

  -- Create new policies
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update existing users to have default values for new fields
UPDATE users 
SET 
  avatar_url = COALESCE(avatar_url, 'https://ui-avatars.com/api/?name=' || COALESCE(name, email) || '&size=200'),
  personality_type = COALESCE(personality_type, 'introvert'),
  daily_rhythm = COALESCE(daily_rhythm, 'early_bird')
WHERE avatar_url IS NULL 
   OR personality_type IS NULL 
   OR daily_rhythm IS NULL;

-- Verify the schema
DO $$ 
DECLARE
  missing_columns TEXT[];
  required_columns TEXT[] := ARRAY[
    'id', 'created_at', 'name', 'email', 'bio', 
    'teach_skills', 'learn_skills', 'embeddings',
    'favorite_ice_cream', 'spirit_animal', 'personality_type', 
    'daily_rhythm', 'personal_color', 'avatar_url'
  ];
  col TEXT;
BEGIN
  -- Check for missing columns
  FOREACH col IN ARRAY required_columns LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='users' AND column_name=col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;
  
  -- Raise notice if any columns are missing
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE NOTICE 'Missing columns: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'All required columns are present in users table';
  END IF;
END $$;
