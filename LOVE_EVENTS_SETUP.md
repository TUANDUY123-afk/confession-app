# Love Events Database Setup

## Tạo bảng lưu trữ Love Events

### Bước 1: Chạy SQL Script trong Supabase

1. Mở Supabase Dashboard
2. Vào **SQL Editor**
3. Mở file `scripts/05-create-love-events-table.sql`
4. Copy và paste nội dung vào SQL Editor
5. Click **Run** để tạo bảng

### Bảng được tạo

```sql
CREATE TABLE IF NOT EXISTS love_events (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  date DATE NOT NULL,
  type VARCHAR DEFAULT 'celebration',
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Cấu trúc bảng

- **id**: ID duy nhất của sự kiện (VARCHAR)
- **title**: Tiêu đề sự kiện (VARCHAR, required)
- **date**: Ngày sự kiện (DATE, required)
- **type**: Loại sự kiện (VARCHAR, mặc định: 'celebration')
  - anniversary: Kỷ niệm
  - milestone: Mốc quan trọng
  - celebration: Lễ kỷ niệm
  - memory: Kỷ niệm
- **description**: Mô tả sự kiện (TEXT, optional)
- **image**: Ảnh (TEXT - base64 string, optional)
- **created_at**: Ngày tạo (TIMESTAMP, tự động)
- **updated_at**: Ngày cập nhật (TIMESTAMP, tự động)

### Indexes

- `idx_love_events_date`: Index trên trường date để query nhanh hơn
- `idx_love_events_type`: Index trên trường type để filter nhanh hơn

### API đã được cập nhật

API route `/api/love-events` đã được cập nhật để:
- **GET**: Lấy tất cả events từ bảng `love_events`
- **POST**: Thêm event mới vào bảng `love_events`
- **DELETE**: Xóa event từ bảng `love_events`

### Lợi ích

1. **Queries nhanh hơn**: Không cần parse JSON
2. **Dễ query**: Có thể filter, sort, search dễ dàng
3. **Scalable**: Có thể thêm nhiều data không lo lỗi
4. **Dễ maintain**: Structure rõ ràng
5. **Index**: Performance tốt hơn với indexes

