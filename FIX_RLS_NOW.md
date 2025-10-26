# ⚡ SỬA LỖI RLS NGAY BÂY GIỜ

## 🔥 Lỗi: "new row violates row-level security policy"

## ✅ GIẢI PHÁP (2 PHÚT)

### Bước 1: Mở Supabase Dashboard
1. Vào: https://supabase.com/dashboard
2. Đăng nhập
3. Chọn project của bạn (tbfvxykfxzvmjqinmpiw)

### Bước 2: Chạy SQL Script
1. Click menu **SQL Editor** (bên trái)
2. Mở file `scripts/08-enable-rls-policies.sql` trong VS Code
3. **Copy TOÀN BỘ** nội dung file (đã cập nhật)
4. Paste vào SQL Editor trong Supabase
5. Click nút **RUN** (hoặc Ctrl+Enter)

### Bước 3: Refresh Trình Duyệt
- Mở http://localhost:3000
- Nhấn **F5** để refresh
- Done! ✅

---

## ⚠️ Nếu Thấy Lỗi "already exists"

Nếu bạn thấy lỗi:
```
ERROR: policy "..." already exists
```

**Có 2 cách xử lý:**

### Cách 1: Chạy file mới (đã fix)
File `scripts/08-enable-rls-policies.sql` đã được cập nhật với `DROP POLICY IF EXISTS`, nên sẽ không còn lỗi này nữa!

### Cách 2: Bỏ qua lỗi
Nếu tất cả policies đã được tạo rồi, bạn chỉ cần:
- Refresh trình duyệt
- Test lại ứng dụng
- Có thể hoạt động bình thường rồi!

---

## 📋 Nội Dung SQL Đã Cập Nhật:

File đã được cập nhật tại: `scripts/08-enable-rls-policies.sql`

Script mới sẽ:
- ✅ Tự động xóa policy cũ nếu đã tồn tại
- ✅ Tạo lại policy mới
- ✅ Không bị lỗi "already exists"

---

## 🎯 Sau Khi Sửa:
- ✅ Upload ảnh được
- ✅ Tạo nhật ký được
- ✅ Like/comment được
- ✅ Thông báo hoạt động
- ✅ Không còn lỗi!
