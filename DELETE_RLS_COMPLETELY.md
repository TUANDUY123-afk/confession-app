# 🗑️ XÓA HOÀN TOÀN RLS

## ✅ CÁCH XÓA RLS 100%

### Bước 1: Mở Supabase SQL Editor
1. Vào: https://supabase.com/dashboard
2. Vào menu **SQL Editor**

### Bước 2: Chạy Script Xóa RLS
1. Mở file: `scripts/11-delete-all-rls-completely.sql`
2. **Copy TOÀN BỘ** nội dung
3. Paste vào SQL Editor
4. Click **RUN** (Ctrl+Enter)

### Bước 3: Xác Nhận
Bạn sẽ thấy:
- ✅ Tất cả policies đã bị xóa
- ✅ RLS đã bị tắt hoàn toàn
- ✅ Không còn lỗi "row-level security policy"

---

## 📋 COPY SCRIPT NGAY ĐÂY:

```sql
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
```

---

## ✅ SAU KHI CHẠY:

1. ✅ Refresh browser (Ctrl + Shift + R hoặc F5)
2. ✅ Test lại ứng dụng
3. ✅ Upload ảnh, tạo diary entry
4. ✅ Done! Không còn lỗi RLS

---

## 🔍 VERIFY (KIỂM TRA):

Để kiểm tra RLS đã bị tắt, chạy SQL:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'love_story', 'diary_entries', 'diary_likes', 'photos', 'comments', 'likes', 'notifications', 'love_events');
```

Nếu thấy `rowsecurity = false` nghĩa là RLS đã được tắt!
