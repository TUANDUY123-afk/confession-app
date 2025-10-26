-- Add purchased_at column to track when the flower was purchased
ALTER TABLE flower_points
ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to use last_updated as purchased_at if purchased_at is NULL
UPDATE flower_points
SET purchased_at = last_updated
WHERE purchased_at IS NULL;
