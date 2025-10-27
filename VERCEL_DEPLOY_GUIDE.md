# 🚀 Hướng Dẫn Deploy Lên Vercel

## 📋 Yêu Cầu

1. **GitHub Repository**: https://github.com/TUANDUY123-afk/confession-app
2. **Supabase Project**: Đã có sẵn
3. **Vercel Account**: Tạo miễn phí tại https://vercel.com

## 🔑 Thông Tin Cần Thiết

### 1. Environment Variables (Từ Supabase)

Đăng nhập vào Supabase Dashboard của bạn và lấy các key sau:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 2. GitHub Repository

```
https://github.com/TUANDUY123-afk/confession-app
```

## 🎯 Các Bước Deploy

### Bước 1: Đăng Ký Vercel

1. Truy cập: https://vercel.com
2. Click "Sign Up"
3. Đăng nhập bằng GitHub

### Bước 2: Import Project

1. Trong Vercel Dashboard, click **"Add New Project"**
2. Chọn **"Import Git Repository"**
3. Chọn repository: `TUANDUY123-afk/confession-app`
4. Click **"Import"**

### Bước 3: Cấu Hình Project

**Framework Preset**: Next.js (tự động detect)

**Root Directory**: `./` (để trống)

**Build Command**: 
```
npm run build
```

**Output Directory**: 
```
.next
```

**Install Command**:
```
npm install --legacy-peer-deps
```

### Bước 4: Thêm Environment Variables

Trong mục **"Environment Variables"**, thêm 3 biến sau:

1. **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   **Value**: URL từ Supabase của bạn

2. **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   **Value**: Anon key từ Supabase

3. **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   **Value**: Service Role Key từ Supabase

**Quan trọng**: 
- ✅ Chọn cả 3 môi trường: Production, Preview, Development
- ✅ Không bỏ dấu ngoặc kép khi nhập value

### Bước 5: Deploy

1. Click **"Deploy"**
2. Chờ quá trình build hoàn tất (khoảng 2-3 phút)
3. Vercel sẽ tự động cung cấp URL: `https://your-project.vercel.app`

## ⚙️ Cấu Hình Bổ Sung

### Vercel Build Settings

File `vercel.json` đã có sẵn với cấu hình:
- Build command: `npm run build`
- Memory limit: 1024MB
- Max duration: 60s

### Auto Deploy

Vercel sẽ tự động deploy khi:
- ✅ Push code lên branch `main`
- ✅ Tạo Pull Request
- ✅ Merge Pull Request

## 🔄 Sử Dụng Vercel CLI (Tùy Chọn)

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Đăng nhập
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

## 📊 Quản Lý Deployment

Truy cập Vercel Dashboard để:
- Xem deployment history
- Xem logs
- Rollback về version cũ
- Xem analytics

## 🎉 Sau Khi Deploy

1. ✅ Test application tại URL được cung cấp
2. ✅ Kiểm tra các chức năng:
   - Upload ảnh
   - Tạo sự kiện
   - Gamification system
3. ✅ Kiểm tra database connections

## 🆘 Nếu Gặp Lỗi

### Lỗi: Build Failed
- Kiểm tra environment variables đã đúng chưa
- Xem logs trong Vercel Dashboard

### Lỗi: Function Timeout
- File `vercel.json` đã cấu hình max duration 60s
- Nếu vẫn timeout, tăng memory limit

### Lỗi: "Resource is limited"
- Vercel Free tier có giới hạn 100 deployments/ngày
- Đợi 12 giờ hoặc nâng cấp lên Pro

## 📝 Lưu Ý Quan Trọng

1. **Environment Variables**:
   - Không commit file `.env.local` lên Git
   - Chỉ thêm vào Vercel Dashboard

2. **Database**:
   - Đảm bảo Supabase RLS đã được disable
   - Hoặc đã tạo policy phù hợp

3. **Storage**:
   - Đảm bảo bucket `photos` đã được tạo và public

4. **Version Control**:
   - Code đã được push lên GitHub
   - Branch `main` là branch chính

## 🎯 Quick Start

Nếu bạn muốn deploy nhanh:

1. Vào https://vercel.com
2. Click "Import Project"
3. Chọn `TUANDUY123-afk/confession-app`
4. Thêm 3 environment variables
5. Click "Deploy"

**Xong! 🚀**
