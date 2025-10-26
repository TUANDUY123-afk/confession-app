# 📝 CHANGELOG

## v2 (Current)
- ✅ Thêm nén ảnh cho Love Story
- ✅ Thêm hiệu ứng tim bay vào tất cả các trang
- ✅ Đổi cơ chế versioning từ 0.1.x sang v1, v2, v3
- ✅ Sửa lỗi hiển thị tên người đăng trong thông báo upload ảnh
- ✅ Thêm GitHub Actions để tự động tăng version

## v1
- ✅ Thêm nén ảnh tự động khi upload (giảm 85% kích thước)
- ✅ Fix upload ảnh qua API route (sử dụng service role key)
- ✅ Fix Vercel memory limit (từ 3008MB → 1024MB)
- ✅ Tự động tăng phiên bản mỗi lần deploy
- ✅ Upload ảnh qua `/api/upload-photo` với compression
- ✅ Nén ảnh > 2MB trước khi upload
- ✅ Hiển thị version trong UI
