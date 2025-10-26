-- Add coins column to love_points table
ALTER TABLE love_points 
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
