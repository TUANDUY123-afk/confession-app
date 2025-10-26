-- ============================================
-- ENABLE ROW LEVEL SECURITY AND POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_story ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
CREATE POLICY "Allow all operations on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- LOVE STORY TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on love_story" ON love_story;
CREATE POLICY "Allow all operations on love_story"
  ON love_story FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- DIARY ENTRIES TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on diary_entries" ON diary_entries;
CREATE POLICY "Allow all operations on diary_entries"
  ON diary_entries FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- DIARY LIKES TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on diary_likes" ON diary_likes;
CREATE POLICY "Allow all operations on diary_likes"
  ON diary_likes FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PHOTOS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on photos" ON photos;
CREATE POLICY "Allow all operations on photos"
  ON photos FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- COMMENTS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on comments" ON comments;
CREATE POLICY "Allow all operations on comments"
  ON comments FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- LIKES TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on likes" ON likes;
CREATE POLICY "Allow all operations on likes"
  ON likes FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;
CREATE POLICY "Allow all operations on notifications"
  ON notifications FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- LOVE EVENTS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all operations on love_events" ON love_events;
CREATE POLICY "Allow all operations on love_events"
  ON love_events FOR ALL
  USING (true)
  WITH CHECK (true);
