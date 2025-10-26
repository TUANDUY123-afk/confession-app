-- Create flower_points table to track points for each owned flower
CREATE TABLE IF NOT EXISTS flower_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id TEXT NOT NULL,
  flower_id TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(couple_id, flower_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_flower_points_couple_flower ON flower_points(couple_id, flower_id);

-- Disable RLS for now
ALTER TABLE flower_points DISABLE ROW LEVEL SECURITY;
