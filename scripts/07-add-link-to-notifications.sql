-- Add link column to notifications table (if not exists)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- Add comment
COMMENT ON COLUMN notifications.link IS 'URL to navigate to when clicking the notification';


