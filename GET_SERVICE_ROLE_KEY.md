# 🔑 Lấy SUPABASE_SERVICE_ROLE_KEY

## Bước 1: Vào Supabase Dashboard

1. Truy cập: https://supabase.com/dashboard
2. Select project của bạn
3. Vào **Settings** (⚙️) ở sidebar trái
4. Click **API** trong menu Settings

## Bước 2: Copy Service Role Key

1. Scroll xuống phần **Project API keys**
2. Tìm **`service_role`** (⚠️ **KHÔNG PHẢI** anon key!)
3. Click **Reveal** (👁️) để hiện key
4. Copy toàn bộ key (dài ~200 ký tự)

**Key sẽ có dạng:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZnZ4eWtmeHp2bWpxaW5tcGl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ2NzEyNSwiZXhwIjoyMDc3MDQzMTI1fQ...
```

## Bước 3: Thêm vào Vercel

1. Quay lại Vercel Environment Variables page
2. Click **Add Another**
3. Key: `SUPABASE_SERVICE_ROLE_KEY`
4. Value: Paste key vừa copy
5. **QUAN TRỌNG:** Chọn **Environment** = **Production, Preview, Development** (hoặc All)
6. Click **Save**

## ⚠️ Lưu ý bảo mật:

- Service role key có full access đến database
- **KHÔNG** commit vào GitHub
- **KHÔNG** share publicly
- Chỉ add trong Vercel Dashboard

