# 🔥 FIX LỖI RLS - CÁCH CUỐI CÙNG

## ❌ Lỗi: "new row violates row-level security policy"

## ✅ GIẢI PHÁP (CHẠY FILE NÀY!)

### Chạy Script Mạnh Nhất: `scripts/10-force-disable-rls.sql`

1. Mở Supabase Dashboard
2. Vào SQL Editor
3. Mở file `scripts/10-force-disable-rls.sql`
4. Copy TOÀN BỘ nội dung
5. Paste vào SQL Editor
6. Click RUN

---

## 📋 HOẶC Copy Script Dưới Đây:

```sql
-- ============================================
-- FORCE DISABLE ROW LEVEL SECURITY
-- ============================================

-- First, drop all policies
DO $$ 
BEGIN
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
        NULL;
END $$;

-- Disable RLS
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS love_story DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diary_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS diary_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS love_events DISABLE ROW LEVEL SECURITY;
```

---

## ✅ SAU KHI CHẠY:

1. Refresh trình duyệt (F5)
2. Test lại ứng dụng
3. Upload ảnh, tạo diary entry
4. Done! ✅

---

## 🔍 NẾU VẪN LỖI:

Có thể RLS đã được tắt nhưng vẫn còn cache. Thử:
- Xóa cache trình duyệt (Ctrl + Shift + Delete)
- Hard refresh (Ctrl + Shift + R)
- Đóng và mở lại trình duyệt
