# ✅ Kiểm tra Vercel Environment Variables

## 🔴 CRITICAL: Thiếu Environment Variables

Upload ảnh không hoạt động có thể do **thiếu hoặc sai** environment variables trong Vercel.

## 📋 Cần thêm vào Vercel (Settings → Environment Variables):

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://tbfvxykfxzvmjqinmpiw.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZnZ4eWtmeHp2bWpxaW5tcGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NjcxMjUsImV4cCI6MjA3NzA0MzEyNX0.EcbImB8wGrt8Zb_YfiNNWagXldX1Mb8MTMTLCU9SUIs
```

### 3. SUPABASE_SERVICE_ROLE_KEY ⚠️
**QUAN TRỌNG:** Cần lấy từ Supabase Dashboard:
1. Vào: https://supabase.com/dashboard/project/YOUR_PROJECT
2. Settings → API
3. Copy **service_role** key (không phải anon_key!)
4. Paste vào Vercel Environment Variables

## 🔍 Kiểm tra Vercel Environment Variables:

1. Vào Vercel Dashboard
2. Chọn project "confession-app"
3. Settings → Environment Variables
4. Đảm bảo có **3 variables** trên
5. Chọn **All Environments** (Production, Preview, Development)

## 📝 Thêm nếu thiếu:

1. Click **Add New**
2. Name: `NEXT_PUBLIC_SUPABASE_URL`
3. Value: Paste URL ở trên
4. Environment: **All**
5. Click **Save**

Lặp lại cho 2 variables còn lại!

## 🔄 Sau khi thêm:

1. **Redeploy** deployment
2. Upload ảnh lại trên Vercel URL
3. Kiểm tra console logs trong browser DevTools


