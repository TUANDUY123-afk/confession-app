-- Add columns for tracking owned flowers and claimed stages
ALTER TABLE love_points 
ADD COLUMN IF NOT EXISTS owned_flowers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS claimed_stages INTEGER[] DEFAULT '{}';
