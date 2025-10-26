-- ============================================
-- XÓA HOÀN TOÀN TẤT CẢ RLS POLICIES
-- ============================================

-- Drop ALL policies on all tables
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on love_story" ON love_story;
DROP POLICY IF EXISTS "Allow all operations on diary_entries" ON diary_entries;
DROP POLICY IF EXISTS "Allow all operations on diary_likes" ON diary_likes;
DROP POLICY IF EXISTS "Allow all operations on photos" ON photos;
DROP POLICY IF EXISTS "Allow all operations on comments" ON comments;
DROP POLICY IF EXISTS "Allow all operations on likes" ON likes;
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all operations on love_events" ON love_events;

-- Disable RLS completely
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS love_story DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diary_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diary_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS love_events DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled (run this in a separate query to check)
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('users', 'love_story', 'diary_entries', 'diary_likes', 'photos', 'comments', 'likes', 'notifications', 'love_events');
