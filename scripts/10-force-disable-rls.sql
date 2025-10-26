-- ============================================
-- FORCE DISABLE ROW LEVEL SECURITY
-- ============================================

-- First, drop all policies (may fail if they don't exist, but that's ok)
DO $$ 
BEGIN
    -- Drop all policies for each table
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on users" ON users';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on love_story" ON love_story';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on diary_entries" ON diary_entries';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on diary_likes" ON diary_likes';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on photos" ON photos';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on comments" ON comments';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on likes" ON likes';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications';
    EXECUTE 'DROP POLICY IF EXISTS "Allow all operations on love_events" ON love_events';
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors
        NULL;
END $$;

-- Now disable RLS on all tables
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS love_story DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diary_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diary_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS love_events DISABLE ROW LEVEL SECURITY;
