-- Add personality and fun fields to users table
-- Created: 1 November 2025
-- Description: Adds personality matching fields for better compatibility

-- Add personality fields to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS favorite_ice_cream TEXT,
  ADD COLUMN IF NOT EXISTS spirit_animal TEXT,
  ADD COLUMN IF NOT EXISTS personality_type TEXT DEFAULT 'introvert' CHECK (personality_type IN ('introvert', 'extrovert')),
  ADD COLUMN IF NOT EXISTS daily_rhythm TEXT DEFAULT 'early_bird' CHECK (daily_rhythm IN ('early_bird', 'night_owl')),
  ADD COLUMN IF NOT EXISTS personal_color TEXT;

-- Add comment
COMMENT ON COLUMN users.favorite_ice_cream IS 'User''s favorite ice cream flavor for fun matching';
COMMENT ON COLUMN users.spirit_animal IS 'User''s spirit animal for personality insights';
COMMENT ON COLUMN users.personality_type IS 'Whether user is introvert or extrovert';
COMMENT ON COLUMN users.daily_rhythm IS 'Whether user is early bird or night owl';
COMMENT ON COLUMN users.personal_color IS 'Color that represents the user';
