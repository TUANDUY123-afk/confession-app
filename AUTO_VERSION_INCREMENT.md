# 🔄 TỰ ĐỘNG TĂNG PHIÊN BẢN MỖI LẦN DEPLOY

## ✅ TÍNH NĂNG MỚI

Tự động tăng version mỗi khi deploy lên Vercel!

---

## 🎯 CÁCH HOẠT ĐỘNG

### Khi Deploy:
1. **Build command** chạy: `npm run build`
2. **Auto update** version trước khi build
3. **Version** tăng lên: `v1` → `v2` → `v3` ...
4. **Build** với version mới
5. **Deploy** lên Vercel

---

## 📊 VERSION FORMAT

### Format: `vNUMBER`

- Đơn giản: `v1`, `v2`, `v3`, `v4` ...
- Tự động tăng mỗi lần deploy
- Không cần major.minor.patch phức tạp

### Hiện Tại:
- **Current**: `v2`
- **Next deploy**: `v3`
- **Sau đó**: `v4`, `v5` ...

---

## 🔧 CẤU TRÚC

### File: `scripts/update-version.ts`

```typescript
// Tự động tăng patch version
function incrementVersion(version: string): string {
  // 0.1.0 → 0.1.1
  // 0.1.1 → 0.1.2
  // ...
}
```

### File: `package.json`

```json
{
  "scripts": {
    "build": "npm run version:update && next build"
  }
}
```

---

## ✅ LỢI ÍCH

1. **Theo dõi phiên bản** - Biết app đang ở version nào ✅
2. **Quản lý releases** - Dễ dàng trace bugs 🐛
3. **Communication** - User biết có update mới 📱
4. **Automated** - Không cần update thủ công 🤖
5. **Professional** - Standard practice cho production apps 🚀

---

## 📝 VÍ DỤ

### Deploy 1:
```bash
Version: v1
Build: ✅
Deploy: ✅
```

### Deploy 2:
```bash
Version: v2 (auto updated!)
Build: ✅
Deploy: ✅
```

### Deploy 3:
```bash
Version: v3 (auto updated!)
Build: ✅
Deploy: ✅
```

---

## 🎛️ MANUAL UPDATE (Nếu cần)

### Reset version:
```bash
# Edit package.json manually
"version": "v1"
```

---

## 🎉 HOÀN THÀNH!

Mỗi lần deploy lên Vercel, version sẽ tự động tăng! 🚀

**Version hiện tại**: `v2`  
**Version tiếp theo**: `v3`
