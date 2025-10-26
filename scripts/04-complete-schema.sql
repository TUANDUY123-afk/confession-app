-- ============================================
-- SUPABASE TABLES - Complete Schema
-- ============================================

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS diary_likes CASCADE;
DROP TABLE IF EXISTS diary_entries CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS love_story CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_name ON users(name);

-- ============================================
-- 2. LOVE STORY TABLE
-- ============================================
CREATE TABLE love_story (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. DIARY ENTRIES TABLE
-- ============================================
CREATE TABLE diary_entries (
  id VARCHAR(255) PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  content TEXT NOT NULL,
  mood VARCHAR(50),
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diary_entries_author ON diary_entries(author);
CREATE INDEX idx_diary_entries_date ON diary_entries(date);

-- ============================================
-- 3.1. DIARY LIKES TABLE
-- ============================================
CREATE TABLE diary_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entry_id, user_name)
);

CREATE INDEX idx_diary_likes_entry_id ON diary_likes(entry_id);
CREATE INDEX idx_diary_likes_user_name ON diary_likes(user_name);

-- ============================================
-- 4. PHOTOS TABLE
-- ============================================
CREATE TABLE photos (
  url VARCHAR(500) PRIMARY KEY,
  title VARCHAR(255),
  filename VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at);

-- ============================================
-- 5. COMMENTS TABLE (for both photos and diary entries)
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url VARCHAR(500) NOT NULL,
  text TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_photo_url ON comments(photo_url);
CREATE INDEX idx_comments_author ON comments(author);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- ============================================
-- 6. LIKES TABLE (for both photos and diary entries)
-- ============================================
CREATE TABLE likes (
  photo_url VARCHAR(500) PRIMARY KEY,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  target VARCHAR(255),
  read_by TEXT[] DEFAULT ARRAY[]::TEXT[],
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_author ON notifications(author);
CREATE INDEX idx_notifications_target ON notifications(target);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp);

-- ============================================
-- TRIGGERS for updated_at
-- ============================================

-- Trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
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

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
