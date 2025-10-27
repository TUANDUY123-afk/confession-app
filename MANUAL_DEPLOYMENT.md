# 🚀 Hướng Dẫn Deploy Thủ Công Lên Vercel

## ✅ Đã Tắt Auto-Deploy

File `vercel.json` đã được cấu hình để **không tự động deploy** khi push code lên GitHub.

## 🎯 Cách Deploy Thủ Công

### Cách 1: Qua Vercel Dashboard (Dễ Nhất)

1. **Truy cập**: https://vercel.com/dashboard
2. **Chọn project** của bạn
3. **Click nút "..."** (menu) bên cạnh project
4. **Chọn "Redeploy"**
5. **Chọn branch**: `main`
6. **Click "Redeploy"**

### Cách 2: Qua GitHub (Recommended)

1. **Push code lên GitHub** (nếu chưa push):
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Vào Vercel Dashboard**: https://vercel.com/dashboard
3. **Chọn project** của bạn
4. **Tab "Deployments"**
5. **Click "Create Deployment"** (nút + ở góc trên)
6. **Chọn branch**: `main`
7. **Click "Deploy"**

### Cách 3: Qua Vercel CLI (Nhanh)

```bash
# Đảm bảo đã cài Vercel CLI
npm i -g vercel

# Login (nếu chưa)
vercel login

# Deploy
vercel --prod
```

## 📋 Checklist Trước Khi Deploy

- [ ] Code đã được commit và push lên GitHub
- [ ] Đã test code trong môi trường local (`npm run dev`)
- [ ] Environment variables đã đúng trong Vercel
- [ ] Database schema đã được update (nếu có thay đổi)

## ⚠️ Lưu Ý

1. **Auto-deploy đã TẮT**, không cần lo Vercel tự động deploy
2. **Deploy thủ công** giúp bạn kiểm soát được thời điểm deploy
3. **Preview deployments** vẫn hoạt động cho Pull Requests
4. **Production deployments** chỉ chạy khi bạn tự tay click

## 🔄 Bật Lại Auto-Deploy

Nếu muốn bật lại auto-deploy, xóa dòng này trong `vercel.json`:

```json
"git": {
  "deploymentEnabled": {
    "main": false
  }
}
```

Sau đó deploy lại qua Vercel Dashboard.

## 🎉 Sau Khi Deploy

1. Kiểm tra URL production
2. Test các chức năng chính
3. Kiểm tra logs nếu có lỗi

**Hoàn thành!** 🚀
