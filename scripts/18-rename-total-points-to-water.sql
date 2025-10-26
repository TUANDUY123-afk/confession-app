-- Rename total_points to water for better gamification theme
ALTER TABLE love_points
RENAME COLUMN total_points TO water;

-- Add comment to clarify
COMMENT ON COLUMN love_points.water IS 'Total water available to water flowers';
