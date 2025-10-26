-- Create love_events table to store events separately
CREATE TABLE IF NOT EXISTS love_events (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  date DATE NOT NULL,
  type VARCHAR DEFAULT 'celebration',
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_love_events_date ON love_events(date);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_love_events_type ON love_events(type);

-- Add comment
COMMENT ON TABLE love_events IS 'Stores love story events/milestones for couples';


