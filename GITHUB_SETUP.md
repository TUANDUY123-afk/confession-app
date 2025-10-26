# 📦 Hướng dẫn Upload Code lên GitHub

## Bước 1: Cài đặt Git

### Windows:
1. Download Git từ: https://git-scm.com/download/win
2. Install với default settings
3. Restart terminal/IDE

### Kiểm tra cài đặt:
```bash
git --version
```

## Bước 2: Khởi tạo Git Repository

### Mở Terminal/PowerShell trong thư mục project và chạy:

```bash
# Khởi tạo Git repo
git init

# Thêm tất cả files
git add .

# Commit lần đầu
git commit -m "Initial commit - Confession App for Couples"
```

## Bước 3: Tạo GitHub Repository

1. **Truy cập:** https://github.com
2. **Sign in** với account GitHub
3. **Click "New"** hoặc "Create repository"
4. **Đặt tên:** `confession-app` (hoặc tên bạn muốn)
5. **Chọn:** Private hoặc Public
6. **KHÔNG** check "Initialize with README"
7. **Click "Create repository"**

## Bước 4: Push Code lên GitHub

Copy và chạy các lệnh (GitHub sẽ hiển thị):

```bash
# Thêm remote repository
git remote add origin https://github.com/your-username/confession-app.git

# Push code
git branch -M main
git push -u origin main
```

**Lưu ý:** Thay `your-username` bằng username GitHub của bạn!

## Bước 5: Verify

1. Refresh trang GitHub repository
2. Kiểm tra files đã được upload chưa

## 🚀 Sau khi có code trên GitHub

Bạn có thể deploy lên Vercel:
1. Truy cập: https://vercel.com
2. Login với GitHub
3. Import repository vừa tạo
4. Vercel sẽ tự động deploy!

## 📝 Tóm tắt Commands

```bash
git init
git add .
git commit -m "Initial commit - Confession App"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## ✅ Done!

Code đã được upload lên GitHub và sẵn sàng để deploy!

