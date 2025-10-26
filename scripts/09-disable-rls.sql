-- ============================================
-- DISABLE ROW LEVEL SECURITY
-- ============================================

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE love_story DISABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE diary_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE love_events DISABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP ALL POLICIES
-- ============================================

-- Drop all policies (if they exist)
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on love_story" ON love_story;
DROP POLICY IF EXISTS "Allow all operations on diary_entries" ON diary_entries;
DROP POLICY IF EXISTS "Allow all operations on diary_likes" ON diary_likes;
DROP POLICY IF EXISTS "Allow all operations on photos" ON photos;
DROP POLICY IF EXISTS "Allow all operations on comments" ON comments;
DROP POLICY IF EXISTS "Allow all operations on likes" ON likes;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all operations on love_events" ON love_events;
