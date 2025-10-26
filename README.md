# 💕 Confession App - Nhật Ký Tình Yêu Đôi

App tương tác dành cho cặp đôi với các tính năng:
- 📖 Nhật ký đôi (Shared Diary)
- 📸 Tường ảnh (Photo Wall)
- 📅 Lịch sự kiện tình yêu (Love Calendar)
- 💌 Thông báo (Notifications)
- 🎂 Đếm ngược ngày kỷ niệm

## 🚀 Tech Stack

- **Framework:** Next.js 15.5.4
- **Database:** Supabase
- **Storage:** Supabase Storage
- **UI:** TailwindCSS + shadcn/ui
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 📋 Yêu cầu

- Node.js 18+
- Supabase account
- Git

## 🛠️ Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/your-username/confession-app.git
cd confession-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Cấu hình Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Setup Database

Chạy các SQL scripts trong folder `scripts/` trên Supabase SQL Editor:

1. `04-complete-schema.sql` - Tạo các bảng
2. `04-setup-storage-bucket.ts` - Setup storage bucket
3. `05-create-love-events-table.sql` - Bảng love events
4. `06-add-link-to-notifications.sql` - Thêm link column

### 5. Run Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
confession-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── page.tsx          # Home page
│   ├── shared-diary/     # Diary page
│   ├── photo-wall/       # Photo wall page
│   ├── love-story/       # Love story page
│   └── anniversary/      # Anniversary page
├── components/            # React components
│   ├── diary/           # Diary components
│   ├── ui/              # shadcn/ui components
│   └── ...
├── contexts/             # React contexts
├── lib/                  # Utilities
├── public/              # Static assets
└── scripts/             # SQL scripts
```

## ✨ Features

### 📖 Nhật Ký Đôi
- Viết và chia sẻ nhật ký
- Upload ảnh
- Like và comment
- Chỉ tác giả mới có thể xóa

### 📸 Tường Ảnh
- Upload nhiều ảnh cùng lúc
- Like và comment ảnh
- Zoom ảnh khi click
- Delete ảnh

### 📅 Lịch Tình Yêu
- Hiển thị lịch theo tháng
- Thêm sự kiện với ảnh
- Color-code theo loại sự kiện
- Xem chi tiết sự kiện

### 💌 Thông Báo
- Thông báo like/comment
- Click để navigate
- Mark as read
- Delete notifications

### 🎂 Đếm Ngược
- Tính số ngày yêu nhau
- Hiển thị milestones
- Đếm ngược events

## 🚀 Deploy

Xem file `DEPLOY.md` để deploy lên Vercel.

## 📝 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 🎨 UI/UX Features

- Smooth transitions và animations
- Responsive design
- Dark mode support
- Mobile-optimized calendar
- Image lazy loading
- Optimized performance với React.memo

## 🔐 Security

- Backend validation for delete operations
- Author-only delete restrictions
- Secure API routes
- Environment variables protection

## 📄 License

MIT

## 👥 Authors

Created with 💕 for couples
