# 🚀 Hướng Dẫn Nhanh Để Chạy Ứng Dụng

## ✅ Bước 1: Đã Hoàn Thành
- ✅ Cài đặt Node.js và npm
- ✅ Cài đặt dependencies (npm install)

## 📋 Bước 2: Thiết Lập Supabase (BẮT BUỘC)

### 2.1 Tạo tài khoản Supabase
1. Truy cập: **https://supabase.com**
2. Đăng ký/đăng nhập (miễn phí)
3. Click **"New Project"**

### 2.2 Lấy thông tin API
1. Sau khi tạo project, vào **Settings** > **API**
2. Copy 2 thông tin:
   - **Project URL**: Ví dụ `https://xxxxx.supabase.co`
   - **service_role key**: Click vào ô "Reveal" để hiển thị (key dài màu xám)

### 2.3 Tạo file .env.local
Tạo file `.env.local` trong thư mục gốc với nội dung:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Lưu ý**: Thay thế bằng thông tin thực tế từ Supabase dashboard của bạn!

## 📋 Bước 3: Tạo Database Tables

### 3.1 Copy SQL Schema
1. Mở file `scripts/04-complete-schema.sql`
2. Copy **TOÀN BỘ** nội dung trong file

### 3.2 Chạy SQL trong Supabase
1. Vào Supabase Dashboard > **SQL Editor**
2. Click **New Query**
3. Paste SQL đã copy
4. Click **Run** (hoặc nhấn Ctrl+Enter)
5. Xác nhận tables đã được tạo (users, photos, love_story, etc.)

## 📋 Bước 4: Setup Storage Bucket

### 4.1 Tạo storage bucket
1. Vào Supabase Dashboard > **Storage**
2. Click **"Create a new bucket"**
3. Nhập tên: `photos`
4. **BẬT toggle "Public bucket"**
5. Click **"Create bucket"**

## 📋 Bước 5: Chạy Ứng Dụng

Mở terminal và chạy:

```bash
npm run dev
```

Mở trình duyệt: **http://localhost:3000**

---

## 🔧 Nếu Gặp Lỗi

### Lỗi: "Missing Supabase environment variables"
- Kiểm tra file `.env.local` đã tạo chưa
- Kiểm tra thông tin URL và key đúng chưa
- Restart terminal và chạy lại `npm run dev`

### Lỗi: "Bucket not found" khi upload ảnh
- Kiểm tra bucket `photos` đã tạo chưa
- Đảm bảo bucket là **Public**
- Tên bucket phải đúng là `photos` (không viết hoa)

### Lỗi: Tables không tồn tại
- Chạy lại SQL từ file `scripts/04-complete-schema.sql`
- Kiểm tra trong Supabase Dashboard > Table Editor

---

## 📞 Cần Giúp Đỡ?

Xem thêm hướng dẫn chi tiết trong file **README.md**


