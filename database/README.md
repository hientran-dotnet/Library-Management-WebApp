# Database Setup Guide

## Tổng quan
Thư mục này chứa các file thiết kế và setup database cho hệ thống quản lý thư viện.

## Cấu trúc files

### 1. `complete_schema.sql`
- **Mục đích**: Schema database hoàn chỉnh với tất cả bảng, triggers, views, procedures
- **Sử dụng**: Cho việc tạo database mới hoặc tham khảo thiết kế
- **Nội dung**: 10 bảng chính + triggers + views + stored procedures

### 2. `quick_setup.sql`
- **Mục đích**: Setup nhanh database cơ bản
- **Sử dụng**: Cho development hoặc demo
- **Nội dung**: Các bảng cơ bản + dữ liệu mẫu

### 3. `migration_script.sql`
- **Mục đích**: Migration từ schema cũ sang schema mới
- **Sử dụng**: Khi cần upgrade database hiện tại
- **Nội dung**: Backup + migration + verification

### 4. `DATABASE_DOCUMENTATION.md`
- **Mục đích**: Tài liệu chi tiết về thiết kế database
- **Nội dung**: Giải thích các bảng, mối quan hệ, business rules

## Hướng dẫn sử dụng

### Tình huống 1: Setup database mới (Recommended)
```sql
-- 1. Tạo database
CREATE DATABASE library_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_management_db;

-- 2. Chạy complete schema
SOURCE complete_schema.sql;
```

### Tình huống 2: Setup nhanh cho development
```sql
-- 1. Tạo database
CREATE DATABASE library_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_management_db;

-- 2. Chạy quick setup
SOURCE quick_setup.sql;
```

### Tình huống 3: Migration từ database cũ
```sql
-- 1. Backup database hiện tại
mysqldump -u username -p library_management_db > backup.sql

-- 2. Tạo schema mới
SOURCE complete_schema.sql;

-- 3. Chạy migration
SOURCE migration_script.sql;
```

## Thông tin kết nối

### Development (localhost)
```php
$host = "localhost";
$username = "root";
$password = "";
$database = "library_management_db";
```

### Production (Railway)
```php
$host = "your-railway-host";
$username = "your-railway-username";
$password = "your-railway-password";
$database = "railway";
```

## Tài khoản admin mặc định
- **Username**: admin
- **Password**: admin123
- **Email**: admin@library.com
- **Role**: super_admin

⚠️ **Lưu ý**: Đổi password sau khi setup xong!

## Cấu trúc bảng chính

### Core Tables
- `categories` - Danh mục sách
- `books` - Thông tin sách
- `members` - Thành viên thư viện
- `borrowing` - Phiếu mượn sách

### Management Tables
- `admin_users` - Tài khoản quản trị
- `reservations` - Đặt trước sách
- `fines` - Phí phạt
- `system_settings` - Cấu hình hệ thống

### Audit Tables
- `audit_log` - Nhật ký hoạt động
- `library_statistics` - Thống kê

## Business Rules

### Mượn sách
- Tối đa 5 cuốn/thành viên
- Thời hạn mượn: 14 ngày
- Gia hạn tối đa: 2 lần
- Phí phạt: 5,000 VND/ngày

### Thành viên
- Mã thành viên tự động: MEM{năm}{6 số}
- Loại thành viên: student, teacher, staff, public
- Trạng thái: active, suspended, expired, inactive

### Sách
- Số lượng có sẵn tự động cập nhật
- Trạng thái: active, inactive, maintenance
- Vị trí lưu trữ theo khu vực

## Views có sẵn

```sql
-- Danh sách đang mượn
SELECT * FROM vw_active_borrowings;

-- Sách quá hạn
SELECT * FROM vw_overdue_books;

-- Lịch sử mượn của thành viên
SELECT * FROM vw_member_borrowing_history WHERE MemberID = 1;

-- Thống kê sách
SELECT * FROM vw_book_statistics;
```

## Stored Procedures

```sql
-- Tính phí phạt
CALL sp_calculate_fine(borrow_id);

-- Cập nhật số lượng sách
CALL sp_update_book_availability(book_id);
```

## Backup & Restore

### Backup
```bash
# Full backup
mysqldump -u username -p library_management_db > backup_full.sql

# Chỉ structure
mysqldump -u username -p --no-data library_management_db > backup_structure.sql

# Chỉ data
mysqldump -u username -p --no-create-info library_management_db > backup_data.sql
```

### Restore
```bash
mysql -u username -p library_management_db < backup_full.sql
```

## Performance Tips

### Indexes
- Tất cả foreign keys đã có index
- Các trường tìm kiếm thường xuyên có index
- Composite indexes cho queries phức tạp

### Optimization
- Sử dụng views cho queries phức tạp
- Stored procedures cho business logic
- Triggers cho data integrity

## Troubleshooting

### Lỗi thường gặp

1. **Foreign key constraint fails**
   - Kiểm tra dữ liệu tham chiếu có tồn tại
   - Chạy script migration đúng thứ tự

2. **Duplicate entry**
   - Kiểm tra unique constraints
   - Xóa dữ liệu trùng lặp trước khi migrate

3. **Connection refused**
   - Kiểm tra thông tin kết nối
   - Đảm bảo MySQL service đang chạy

### Debug queries
```sql
-- Kiểm tra foreign key constraints
SELECT * FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = 'library_management_db';

-- Kiểm tra table sizes
SELECT 
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'library_management_db';
```

## Contact
Nếu có vấn đề về database, vui lòng tạo issue hoặc liên hệ team phát triển.
