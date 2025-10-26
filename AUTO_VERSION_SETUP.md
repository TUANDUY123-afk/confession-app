# 🔄 TỰ ĐỘNG TĂNG PHIÊN BẢN MỖI LẦN DEPLOY

## ✅ ĐÃ THIẾT LẬP

Version sẽ tự động tăng mỗi lần push code lên GitHub!

---

## 🎯 CÁCH HOẠT ĐỘNG

### Option 1: Vercel Build (Đã Setup)
1. Push code lên GitHub
2. Vercel tự động build: `npm run build`
3. Build script: `npm run version:update && next build`
4. Version tự động tăng
5. Deploy với version mới

### Option 2: GitHub Actions (Mới Thêm)
1. Push code lên GitHub
2. GitHub Actions tự động chạy
3. Tăng version
4. Commit lại version
5. Trigger Vercel deploy

---

## 📝 LƯU Ý

### GitHub Actions Settings
1. Vào repository settings
2. Settings → Actions → General
3. Enable "Allow GitHub Actions to create and approve pull requests"
4. Save

### Permissions
- Workflow cần quyền ghi
- Token `GITHUB_TOKEN` tự động có sẵn

---

## 🔧 TROUBLESHOOTING

### Nếu GitHub Actions không chạy:
1. Check Actions tab trong GitHub
2. Verify workflow file exists
3. Check permissions

### Nếu version không tăng:
1. Verify `package.json` script
2. Check `scripts/update-version.ts`
3. Check build logs trong Vercel

---

## 🎉 KẾT QUẢ

**Mỗi lần push code → Version tự động tăng!**

- Version hiện tại: `v0.1.4`
- Push tiếp theo: `v0.1.5`
- Sau đó: `v0.1.6`...

---

## ✅ HOÀN THÀNH!

Không cần làm gì cả, version sẽ tự động tăng! 🚀
