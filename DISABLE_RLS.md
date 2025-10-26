# 🚫 TẮT ROW LEVEL SECURITY (RLS)

## ✅ CÁCH TẮT RLS

### Bước 1: Mở Supabase Dashboard
1. Vào: https://supabase.com/dashboard
2. Đăng nhập
3. Chọn project của bạn

### Bước 2: Chạy SQL Script
1. Click menu **SQL Editor** (bên trái)
2. Mở file `scripts/09-disable-rls.sql` trong VS Code
3. **Copy TOÀN BỘ** nội dung file
4. Paste vào SQL Editor trong Supabase
5. Click nút **RUN** (hoặc Ctrl+Enter)

### Bước 3: Xác Nhận
Sau khi chạy script, bạn sẽ thấy:
- ✅ RLS đã được tắt cho tất cả tables
- ✅ Tất cả policies đã được xóa
- ✅ Ứng dụng có thể truy cập database tự do

### Bước 4: Test Lại
- Refresh trình duyệt (http://localhost:3000)
- Thử upload ảnh, tạo diary entry
- Ứng dụng sẽ hoạt động bình thường!

---

## 📋 Script Sẽ Làm Gì?

Script `scripts/09-disable-rls.sql` sẽ:
1. ✅ Tắt RLS cho tất cả tables
2. ✅ Xóa tất cả policies
3. ✅ Cho phép truy cập database không giới hạn

---

## ⚠️ Lưu Ý

- **Không phù hợp cho production**: Tắt RLS nghĩa là không còn bảo mật
- **Chỉ dùng cho development**: Phù hợp khi test hoặc demo
- **Bảo mật kém**: Ai cũng có thể truy cập và sửa data

---

## 🔄 Muốn BẬT Lại RLS?

Nếu muốn bật lại RLS sau này, chạy lại file:
- `scripts/08-enable-rls-policies.sql`
