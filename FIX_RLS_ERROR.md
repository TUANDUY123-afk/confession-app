# 🔧 Hướng Dẫn Sửa Lỗi Row Level Security (RLS)

## ❌ Lỗi Hiện Tại
```
Console StorageApiError
new row violates row-level security policy
```

## 🔍 Nguyên Nhân
Supabase đang bật Row Level Security (RLS) nhưng chưa có policies nào được tạo, dẫn đến việc không thể thực hiện bất kỳ thao tác nào với database.

## ✅ Cách Sửa

### Bước 1: Mở Supabase SQL Editor
1. Đăng nhập vào Supabase Dashboard: https://supabase.com
2. Chọn project của bạn
3. Vào menu **SQL Editor** ở thanh bên trái

### Bước 2: Chạy SQL Script
1. Mở file `scripts/08-enable-rls-policies.sql`
2. Copy **TOÀN BỘ** nội dung trong file
3. Paste vào SQL Editor trong Supabase
4. Click **Run** (hoặc nhấn Ctrl+Enter)

### Bước 3: Xác Nhận
Sau khi chạy script thành công, bạn sẽ thấy:
- ✅ Tất cả tables đã enable RLS
- ✅ Policies đã được tạo cho mỗi table
- ✅ Ứng dụng có thể thực hiện CRUD operations

### Bước 4: Test Lại
1. Refresh lại trình duyệt (http://localhost:3000)
2. Thử upload ảnh, tạo diary entry, hoặc bất kỳ thao tác nào
3. Lỗi "row-level security policy" sẽ biến mất

## 📝 Lưu Ý
- Script này tạo policies cho phép **TẤT CẢ** operations (SELECT, INSERT, UPDATE, DELETE)
- Phù hợp cho ứng dụng demo/personal
- Nếu cần bảo mật cao hơn, có thể chỉnh sửa policies theo yêu cầu

## 🚀 Sau Khi Sửa
Ứng dụng sẽ hoạt động bình thường:
- ✅ Upload ảnh
- ✅ Tạo diary entries
- ✅ Like và comment
- ✅ Thêm notifications
- ✅ Tất cả các features khác
