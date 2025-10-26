# 🔧 Troubleshooting Upload Issues trên Vercel

## Vấn đề: "Cannot upload images" trên Vercel URL

### ✅ Giải pháp 1: Environment Variables

**Kiểm tra trong Vercel Dashboard:**

1. Settings → Environment Variables
2. Đảm bảo có:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **QUAN TRỌNG**
3. Chọn **All Environments**

### ✅ Giải pháp 2: Storage Bucket Permissions

**Kiểm tra trong Supabase Dashboard:**

1. Storage → photos bucket
2. **Public** toggle phải **BẬT** (ON)
3. **Policies** phải có:
   - `SELECT` for anonymous/public
   - `INSERT` for authenticated

### ✅ Giải pháp 3: CORS & Browser Console

**Kiểm tra lỗi:**

1. Mở browser console (F12)
2. Try upload ảnh
3. Xem lỗi trong Console tab:
   - `Failed to fetch` → Network issue
   - `403 Forbidden` → Permissions issue
   - `Bucket not found` → Storage issue

### ✅ Giải pháp 4: Redeploy

**Sau khi fix environment variables:**

1. Vào Vercel Dashboard
2. Chọn deployment mới nhất
3. Click **Redeploy**
4. Chờ build xong
5. Try upload lại

## 📝 Debug Steps:

1. ✅ Check Vercel logs trong Dashboard → Deployments → [latest] → Logs
2. ✅ Check browser console khi upload
3. ✅ Verify environment variables
4. ✅ Verify storage bucket is public
5. ✅ Try upload file nhỏ hơn (không lớn hơn 25MB)

## 🎯 Checklist:

- [ ] Environment variables set trong Vercel
- [ ] Storage bucket "photos" is public
- [ ] Upload file size < 25MB
- [ ] Redeployed sau khi fix env vars

