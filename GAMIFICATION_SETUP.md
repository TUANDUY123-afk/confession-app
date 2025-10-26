# 🎮 Gamification System Setup

## 📋 Bước 1: Tạo bảng trong Supabase

Vào Supabase Dashboard → SQL Editor → chạy file `scripts/12-create-gamification-tables.sql`

Hoặc copy/paste đoạn SQL sau:

```sql
-- Create Love Points table
CREATE TABLE IF NOT EXISTS love_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id TEXT NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Achievement Progress table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(couple_id, achievement_type)
);

-- Create Activity Log (for tracking points)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  points_awarded INTEGER NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_love_points_couple_id ON love_points(couple_id);
CREATE INDEX IF NOT EXISTS idx_achievements_couple_id ON achievements(couple_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_couple_id ON activity_log(couple_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- Disable RLS for now (since we're using service role key)
ALTER TABLE love_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
```

## ✅ Kiểm tra đã tạo thành công

Vào Supabase Dashboard → Table Editor → kiểm tra xem có 3 bảng:
- `love_points`
- `achievements`
- `activity_log`

## 🧪 Test nút thêm điểm

1. Vào trang `/gamification`
2. Click nút "+10 Điểm", "+50 Điểm", hoặc "+100 Điểm"
3. Kiểm tra xem điểm có tăng không
4. Kiểm tra console có lỗi gì không

## 🔍 Debug nếu có lỗi

Mở Developer Console (F12) và kiểm tra:
- Lỗi API: `/api/gamification/points`
- Lỗi database: Check xem có câu lỗi SQL không
- Lỗi TypeScript: Check terminal khi chạy `npm run dev`

## 📊 Cách kiếm điểm tự động

- ✅ Upload ảnh: +10 điểm/ảnh
- ✅ Thêm sự kiện: +50 điểm/sự kiện
- 🔜 Ghi nhật ký: +30 điểm (đang implement)
- 🔜 Gửi tin nhắn: +5 điểm (đang implement)
- 🔜 Hoàn thành thành tích: +100-500 điểm (đang implement)
