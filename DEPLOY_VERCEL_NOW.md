# 🚀 DEPLOY LÊN VERCEL - HƯỚNG DẪN NHANH

## ✅ ĐÃ CHUẨN BỊ XONG

- ✅ Code đã được commit
- ✅ Code đã được push lên GitHub
- ✅ Fix upload photo v15 đã có sẵn

---

## 🎯 DEPLOY NGAY BÂY GIỜ

### Cách 1: Deploy Tự Động (Nếu đã connect với Vercel)

Nếu project đã được connect với Vercel, nó sẽ **tự động deploy** khi bạn push code!

**Kiểm tra**: https://vercel.com/dashboard

### Cách 2: Deploy Thủ Công

#### Bước 1: Vào Vercel Dashboard
1. Truy cập: https://vercel.com
2. Đăng nhập với GitHub
3. Click **"Add New Project"**

#### Bước 2: Import Project
1. Chọn repository: `confession-app`
2. Click **"Import"**

#### Bước 3: Cấu Hình
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

**Click "Deploy"**

#### Bước 4: Thêm Environment Variables
Sau khi deploy xong, thêm environment variables:

1. Vào Settings → Environment Variables
2. Thêm 3 variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tbfvxykfxzvmjqinmpiw.supabase.co
```

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZnZ4eWtmeHp2bWpxaW5tcGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjcxMjUsImV4cCI6MjA3NzA0MzEyNX0.EcbImB8wGrt8Zb_YfiNNWagXldX1Mb8MTMTLCU9SUIs
```

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZnZ4eWtmeHp2bWpxaW5tcGl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ2NzEyNSwiZXhwIjoyMDc3MDQzMTI1fQ.sdhX51l-gDz47BOHRJ7uBkExfLz1QLB3DoX7d-hAwuE
```

⚠️ **QUAN TRỌNG**: Chọn **All Environments** cho mỗi variable!

#### Bước 5: Redeploy
1. Vào Deployments
2. Click "..." → **Redeploy**
3. Chờ build xong

---

## ✅ SAU KHI DEPLOY

### Kiểm tra:
1. ✅ Mở production URL (https://your-app.vercel.app)
2. ✅ Test upload ảnh
3. ✅ Upload sẽ hoạt động như v12!

---

## 🔧 NẾU GẶP LỖI

### Lỗi upload ảnh trên Vercel:
1. Kiểm tra environment variables đã thêm chưa
2. Kiểm tra bucket "photos" đã tạo trong Supabase chưa
3. Check Vercel logs để xem lỗi chi tiết

### Fix RLS nếu cần:
Chạy SQL script: `scripts/11-delete-all-rls-completely.sql`

---

## 🎉 DONE!

App đã được deploy lên Vercel! 🚀

**Production URL**: https://your-app-name.vercel.app
