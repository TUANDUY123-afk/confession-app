# 🚀 Sửa lỗi Push lên GitHub

## ❌ Lỗi hiện tại:
```
error: src refspec main does not match any
error: failed to push some refs to ...
```

## ✅ Nguyên nhân:
**Chưa có commit nào trong repository!**

## 🔧 Cách sửa:

Chạy các lệnh này theo thứ tự trong PowerShell:

### Bước 1: Add files
```bash
git add .
```

### Bước 2: Commit
```bash
git commit -m "Initial commit - Confession App for Couples"
```

### Bước 3: Push
```bash
git push -u origin main
```

## ✅ Hoàn tất!

Sau khi chạy các lệnh trên, code sẽ được push lên GitHub thành công.

## 📝 Full Commands (Nếu git chưa được init):

Nếu chưa init Git, chạy thêm:
```bash
git init
git remote add origin https://github.com/TUANDUY123-afk/confession-app.git
git config user.email "your-email@example.com"
git config user.name "TUANDUY123"
```

Rồi chạy 3 bước trên!

