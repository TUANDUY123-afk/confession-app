-- Recreate comprehensive Supabase tables for data synchronization
-- This script drops all existing tables and recreates them with proper dependencies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all existing tables in reverse dependency order to avoid constraint conflicts
DROP TABLE IF EXISTS love_events CASCADE;
DROP TABLE IF EXISTS diary_comments CASCADE;
DROP TABLE IF EXISTS diary_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS diary_entries CASCADE;
DROP TABLE IF EXISTS love_story CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Love Story table
CREATE TABLE love_story (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Diary Entries table
CREATE TABLE diary_entries (
  id VARCHAR(255) PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  mood VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL UNIQUE,
  title VARCHAR(500),
  filename VARCHAR(500),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments table (for photo comments)
CREATE TABLE comments (
  id VARCHAR(255) PRIMARY KEY,
  photo_url TEXT NOT NULL,
  text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photo_url) REFERENCES photos(url) ON DELETE CASCADE
);

-- Likes table (for photo likes)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_url TEXT NOT NULL UNIQUE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photo_url) REFERENCES photos(url) ON DELETE CASCADE
);

-- Diary Comments table
CREATE TABLE diary_comments (
  id VARCHAR(255) PRIMARY KEY,
  entry_id VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE
);

-- Diary Likes table
CREATE TABLE diary_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id VARCHAR(255) NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entry_id),
  FOREIGN KEY (entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  author VARCHAR(255),
  target VARCHAR(255),
  link TEXT,
  read_by TEXT[] DEFAULT ARRAY[]::TEXT[],
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Love Events table
CREATE TABLE love_events (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  days_until INTEGER,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_diary_entries_author ON diary_entries(author);
CREATE INDEX idx_diary_entries_date ON diary_entries(date);
CREATE INDEX idx_comments_photo_url ON comments(photo_url);
CREATE INDEX idx_comments_author ON comments(author);
CREATE INDEX idx_diary_comments_entry_id ON diary_comments(entry_id);
CREATE INDEX idx_diary_comments_author ON diary_comments(author);
CREATE INDEX idx_diary_likes_entry_id ON diary_likes(entry_id);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp);
CREATE INDEX idx_notifications_target ON notifications(target);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at);
CREATE INDEX idx_users_name ON users(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_love_story_updated_at BEFORE UPDATE ON love_story
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at BEFORE UPDATE ON diary_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_likes_updated_at BEFORE UPDATE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_comments_updated_at BEFORE UPDATE ON diary_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_likes_updated_at BEFORE UPDATE ON diary_likes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_love_events_updated_at BEFORE UPDATE ON love_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
