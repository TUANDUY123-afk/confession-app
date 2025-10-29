# Hướng dẫn Deploy Tự Động

## ✅ Đã cấu hình

File `vercel.json` đã được cập nhật để bật deploy tự động từ branch `main`.

## 📋 Các bước để kích hoạt deploy tự động

### 1. Kết nối với Vercel (Nếu chưa có)

1. Truy cập [Vercel Dashboard](https://vercel.com/dashboard)
2. Import project từ GitHub repository
3. Đảm bảo đã kết nối repository đúng

### 2. Cấu hình Environment Variables

Trong Vercel Dashboard, thêm các biến môi trường:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Các biến khác cần thiết

### 3. Deploy tự động

Sau khi push code lên branch `main`, Vercel sẽ tự động:
- ✅ Detect changes
- ✅ Build project (`npm run build`)
- ✅ Deploy lên production
- ✅ Gửi notification (nếu có cấu hình)

## 🔄 Workflow Deploy

```
git push origin main
    ↓
Vercel detect changes
    ↓
npm install --legacy-peer-deps
    ↓
npm run build
    ↓
Deploy to production
    ↓
Auto-update version (nếu có script)
```

## ⚙️ Cấu hình trong vercel.json

- **Build Command**: `npm run build`
- **Deploy từ branch**: `main` (đã bật)
- **Region**: `iad1` (US East)
- **API Functions**: Max duration 60s, Memory 1024MB

## 🔍 Kiểm tra Deploy

- Xem logs: Vercel Dashboard → Deployments
- Preview URL: Mỗi commit có preview URL riêng
- Production URL: URL chính sau khi deploy thành công

## 📦 GitHub Actions (Tùy chọn)

Đã tạo file `.github/workflows/deploy.yml` để:
- ✅ Chạy linter trước khi deploy
- ✅ Build và test trước khi deploy
- ✅ Deploy lên Vercel production

**Lưu ý**: Nếu đã dùng Vercel auto-deploy, GitHub Actions này là tùy chọn. Nếu muốn dùng, cần thêm secrets trong GitHub:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 🚨 Troubleshooting

Nếu deploy không tự động:
1. Kiểm tra Vercel Dashboard → Settings → Git
2. Đảm bảo repository được kết nối
3. Kiểm tra branch `main` có được enable không
4. Xem logs trong Vercel để debug

