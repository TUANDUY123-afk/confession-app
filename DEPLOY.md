# 🚀 Hướng dẫn Deploy App lên Vercel

## Bước 1: Chuẩn bị Code

### 1.1 Đảm bảo code đã commit vào Git
```bash
git add .
git commit -m "Chuẩn bị deploy"
git push origin main
```

## Bước 2: Deploy lên Vercel

### Cách 1: Deploy qua Vercel CLI (Khuyến nghị)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login vào Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Deploy production:**
```bash
vercel --prod
```

### Cách 2: Deploy qua Vercel Dashboard (Dễ nhất)

1. **Truy cập:** https://vercel.com
2. **Sign in** với GitHub account
3. **Click "Add New Project"**
4. **Import repository** từ GitHub
5. **Configure Project:**
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## Bước 3: Cấu hình Environment Variables

Trong Vercel Dashboard → Settings → Environment Variables, thêm:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**QUAN TRỌNG:** Chọn **All Environments** (Production, Preview, Development) cho tất cả variables!

## Bước 4: Deploy & Test

1. Click **Deploy**
2. Chờ build hoàn thành (1-2 phút)
3. Test app trên production URL

## 🔧 Troubleshooting

### Lỗi "Missing Supabase environment variables"
→ Kiểm tra lại environment variables trong Vercel Dashboard

### Lỗi "API route not found"
→ Đảm bảo tất cả API routes trong folder `app/api/` đã có sẵn

### Build fails
→ Check build logs trong Vercel Dashboard để xem lỗi chi tiết

## 📝 Notes

- App sẽ tự động deploy mỗi khi push code lên GitHub
- Production URL sẽ có dạng: `https://your-app-name.vercel.app`
- Có thể setup custom domain trong Vercel Settings

## 🎉 Done!

Sau khi deploy thành công, app sẽ accessible trên internet!

