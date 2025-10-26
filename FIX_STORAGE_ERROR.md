# 🔧 FIX LỖI STORAGE UPLOAD

## ❌ Lỗi: "Cannot upload to Supabase Storage"

## ✅ GIẢI PHÁP

### Bước 1: Kiểm Tra Storage Bucket

1. Vào Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào menu **Storage** (bên trái)
4. Kiểm tra xem có bucket tên **"photos"** chưa

### Bước 2: Tạo Bucket Nếu Chưa Có

**Nếu KHÔNG thấy bucket "photos":**

1. Click **"New bucket"** hoặc **"Create bucket"**
2. Nhập tên: `photos` (chính xác, không viết hoa)
3. **BẬT toggle "Public bucket"** ⚠️ **QUAN TRỌNG!**
4. Click **"Create bucket"**

### Bước 3: Kiểm Tra Bucket Permissions

1. Click vào bucket "photos"
2. Vào tab **"Policies"** hoặc **"Permissions"**
3. Đảm bảo có policies:
   - Allow public SELECT (read)
   - Allow authenticated INSERT (upload)

Hoặc chạy script tự động:

```bash
npx ts-node scripts/04-setup-storage-bucket.ts
```

### Bước 4: Xóa RLS (Nếu Vẫn Lỗi)

Nếu vẫn lỗi, có thể do RLS. Chạy:

```sql
-- File: scripts/11-delete-all-rls-completely.sql
-- Copy và chạy trong Supabase SQL Editor
```

### Bước 5: Test Lại

1. Refresh browser (Ctrl + Shift + R)
2. Try upload ảnh lại
3. Check console log

---

## 🔍 CHECKLIST

- [ ] Bucket "photos" đã được tạo
- [ ] Bucket "photos" là **Public**
- [ ] Có service_role_key trong .env.local
- [ ] Đã chạy script xóa RLS (nếu cần)
- [ ] Browser cache đã được xóa

---

## 📝 SCRIPT SETUP STORAGE

File: `scripts/04-setup-storage-bucket.ts`

Chạy: `npx ts-node scripts/04-setup-storage-bucket.ts`
