-- Script to recreate achievements table with improved structure
-- This will drop the old table and create a new one optimized for achievement tracking

-- Drop the old achievements table (if exists)
DROP TABLE IF EXISTS achievements CASCADE;

-- Create new Achievement Progress table with improved structure
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Unique constraint: one achievement type per couple
  UNIQUE(couple_id, achievement_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievements_couple_id ON achievements(couple_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON achievements(unlocked) WHERE unlocked = true;

-- Disable RLS (Row Level Security) since we're using service role key
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE achievements IS 'Stores achievement progress for couples. Each achievement type tracks progress with multiple levels/stages.';
COMMENT ON COLUMN achievements.progress IS 'Current progress value for the achievement';
COMMENT ON COLUMN achievements.target IS 'Maximum target value (highest level target)';
COMMENT ON COLUMN achievements.metadata IS 'JSONB field storing unlocked_levels array and other achievement metadata';
COMMENT ON COLUMN achievements.achievement_type IS 'Type of achievement: daily_diary, like_master, comment_king, photo_collector, love_garden_bloom, etc.';

