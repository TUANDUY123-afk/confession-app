# 🔄 TỰ ĐỘNG TĂNG PHIÊN BẢN MỖI LẦN DEPLOY

## ✅ TÍNH NĂNG MỚI

Tự động tăng version mỗi khi deploy lên Vercel!

---

## 🎯 CÁCH HOẠT ĐỘNG

### Khi Deploy:
1. **Build command** chạy: `npm run build`
2. **Auto update** version trước khi build
3. **Version** tăng lên: `0.1.0` → `0.1.1` → `0.1.2` ...
4. **Build** với version mới
5. **Deploy** lên Vercel

---

## 📊 VERSION FORMAT

### Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Tăng khi có breaking changes (1.0.0)
- **MINOR**: Tăng khi có tính năng mới (0.1.0)
- **PATCH**: Tăng khi fix bug (0.0.1)

### Hiện Tại:
- **Starting**: `0.1.0`
- **Next deploy**: `0.1.1`
- **Sau đó**: `0.1.2`, `0.1.3` ...

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
Version: 0.1.0
Build: ✅
Deploy: ✅
```

### Deploy 2:
```bash
Version: 0.1.1 (auto updated!)
Build: ✅
Deploy: ✅
```

### Deploy 3:
```bash
Version: 0.1.2 (auto updated!)
Build: ✅
Deploy: ✅
```

---

## 🎛️ MANUAL UPDATE (Nếu cần)

### Update major version:
```bash
# Edit package.json manually
"version": "1.0.0"
```

### Update minor version:
```bash
# Edit package.json manually
"version": "0.2.0"
```

---

## 🎉 HOÀN THÀNH!

Mỗi lần deploy lên Vercel, version sẽ tự động tăng! 🚀

**Version hiện tại**: `0.1.1`  
**Version tiếp theo**: `0.1.2`
