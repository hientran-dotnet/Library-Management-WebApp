# LIBRARY MANAGEMENT SYSTEM - DATABASE DOCUMENTATION

## 📊 Database Schema Overview

Hệ thống quản lý thư viện với 10 bảng chính, được thiết kế để hỗ trợ đầy đủ các chức năng quản lý sách, thành viên, mượn/trả, và báo cáo.

## 🗂️ Table Structure

### 1. **categories** - Danh mục sách
```sql
- CategoryID (PK) - ID danh mục
- CategoryName - Tên danh mục (unique)
- Description - Mô tả
- CreatedAt, UpdatedAt - Timestamps
```

### 2. **books** - Quản lý sách
```sql
- BookID (PK) - ID sách
- Title - Tiêu đề sách
- Author - Tác giả
- ISBN - Mã ISBN (unique)
- CategoryID (FK) - Danh mục
- PublishYear - Năm xuất bản
- Publisher - Nhà xuất bản
- Quantity - Số lượng tổng
- AvailableQuantity - Số lượng có sẵn
- Description - Mô tả
- ImagePath - Đường dẫn ảnh
- Location - Vị trí trên kệ
- Price - Giá sách
- Status - Trạng thái (active/deleted/archived/maintenance)
```

### 3. **members** - Thành viên thư viện
```sql
- MemberID (PK) - ID thành viên
- MemberCode - Mã thành viên (unique)
- FullName - Họ tên
- Email - Email (unique)
- Phone - Số điện thoại
- Address - Địa chỉ
- DateOfBirth - Ngày sinh
- Gender - Giới tính
- IdentityCard - CMND/CCCD
- MembershipType - Loại thành viên (standard/premium/vip)
- MembershipDate - Ngày đăng ký
- ExpiryDate - Ngày hết hạn
- Status - Trạng thái (active/inactive/suspended/expired)
- MaxBorrowBooks - Số sách mượn tối đa
- MaxBorrowDays - Số ngày mượn tối đa
```

### 4. **borrowing** - Quản lý mượn/trả
```sql
- BorrowID (PK) - ID giao dịch mượn
- BookID (FK) - ID sách
- MemberID (FK) - ID thành viên
- BorrowDate - Ngày mượn
- DueDate - Ngày hết hạn
- ReturnDate - Ngày trả (dự kiến)
- ActualReturnDate - Ngày trả thực tế
- Status - Trạng thái (borrowed/returned/overdue/lost/damaged)
- Fine - Tiền phạt
- FineReason - Lý do phạt
- RenewalCount - Số lần gia hạn
- LibrarianID - ID thủ thư xử lý
```

### 5. **reservations** - Đặt chỗ sách
```sql
- ReservationID (PK) - ID đặt chỗ
- BookID (FK) - ID sách
- MemberID (FK) - ID thành viên
- ReservationDate - Ngày đặt
- ExpiryDate - Ngày hết hạn đặt chỗ
- Status - Trạng thái (active/fulfilled/cancelled/expired)
- NotificationSent - Đã gửi thông báo
```

### 6. **admin_users** - Người dùng quản trị
```sql
- AdminID (PK) - ID admin
- Username - Tên đăng nhập (unique)
- Password - Mật khẩu (đã hash)
- FullName - Họ tên
- Email - Email (unique)
- Role - Vai trò (admin/librarian/assistant)
- Status - Trạng thái (active/inactive/suspended)
- LastLogin - Lần đăng nhập cuối
- LoginAttempts - Số lần thử đăng nhập
- LockedUntil - Khóa đến ngày
```

### 7. **fines** - Quản lý phạt
```sql
- FineID (PK) - ID phạt
- BorrowID (FK) - ID giao dịch mượn
- MemberID (FK) - ID thành viên
- FineType - Loại phạt (overdue/damage/lost/other)
- Amount - Số tiền phạt
- AmountPaid - Số tiền đã trả
- Status - Trạng thái (pending/paid/waived/partial)
- DueDate - Hạn nộp phạt
- PaidDate - Ngày nộp phạt
- WaivedBy - Người miễn phạt
```

### 8. **audit_log** - Nhật ký hoạt động
```sql
- LogID (PK) - ID log
- TableName - Tên bảng thay đổi
- RecordID - ID bản ghi
- Action - Hành động (INSERT/UPDATE/DELETE)
- OldValues - Giá trị cũ (JSON)
- NewValues - Giá trị mới (JSON)
- ChangedBy - Người thay đổi
- ChangedAt - Thời gian thay đổi
- IPAddress - Địa chỉ IP
```

### 9. **system_settings** - Cài đặt hệ thống
```sql
- SettingID (PK) - ID cài đặt
- SettingKey - Khóa cài đặt (unique)
- SettingValue - Giá trị
- Description - Mô tả
- DataType - Kiểu dữ liệu
- IsEditable - Có thể chỉnh sửa
```

### 10. **library_statistics** - Thống kê thư viện
```sql
- StatID (PK) - ID thống kê
- StatDate - Ngày thống kê (unique)
- TotalBooks - Tổng số sách
- TotalMembers - Tổng số thành viên
- ActiveMembers - Thành viên đang hoạt động
- BooksIssued - Sách được mượn
- BooksReturned - Sách được trả
- OverdueBooks - Sách quá hạn
- NewMembersAdded - Thành viên mới
- FinesCollected - Tiền phạt thu được
```

## 🔧 Features & Constraints

### ✅ **Data Integrity**
- Foreign Key Constraints giữa tất cả các bảng liên quan
- Check Constraints cho validation dữ liệu
- Unique Constraints cho các trường quan trọng
- NOT NULL constraints cho các trường bắt buộc

### ✅ **Auto-Update Triggers**
- **tr_borrowing_insert**: Tự động giảm AvailableQuantity khi mượn sách
- **tr_borrowing_update**: Cập nhật AvailableQuantity khi trả sách
- **tr_borrowing_delete**: Khôi phục AvailableQuantity khi xóa giao dịch
- **tr_books_update_quantity**: Đồng bộ AvailableQuantity khi thay đổi Quantity

### ✅ **Optimized Indexes**
- Primary keys và foreign keys
- Composite indexes cho các truy vấn phổ biến
- Indexes cho các trường tìm kiếm thường xuyên
- Full-text search indexes (optional)

### ✅ **Useful Views**
- **view_available_books**: Danh sách sách có sẵn
- **view_current_borrowings**: Giao dịch mượn hiện tại
- **view_member_statistics**: Thống kê thành viên

### ✅ **Stored Procedures**
- **sp_update_overdue_books()**: Tính toán và cập nhật sách quá hạn
- **sp_generate_member_code()**: Tạo mã thành viên tự động

## 📈 Performance Optimization

### **Indexing Strategy**
```sql
-- Composite indexes cho queries phổ biến
idx_books_category_status (CategoryID, Status)
idx_borrowing_member_status_date (MemberID, Status, BorrowDate)
idx_members_status_membership (Status, MembershipType)

-- Single column indexes
idx_title, idx_author, idx_isbn (books)
idx_member_code, idx_fullname, idx_email (members)
idx_borrow_date, idx_due_date, idx_return_date (borrowing)
```

### **Query Optimization**
- Views giảm thiểu JOIN phức tạp
- Triggers tự động cập nhật, giảm tải ứng dụng
- Proper data types cho storage efficiency
- Partitioning ready cho large datasets

## 🛡️ Security Features

### **Authentication & Authorization**
- Hashed passwords sử dụng bcrypt
- Role-based access control (admin/librarian/assistant)
- Account locking mechanism
- Session management ready

### **Audit Trail**
- Complete audit log cho tất cả thay đổi dữ liệu
- IP address và user agent tracking
- JSON storage cho old/new values
- Immutable log records

### **Data Protection**
- No plain text passwords
- Proper constraints prevent data corruption
- Referential integrity maintained
- Soft delete với status fields

## 📊 Reporting Capabilities

### **Built-in Statistics**
- Daily statistics tracking
- Member activity monitoring
- Book circulation analytics
- Fine collection reporting

### **Custom Reports Ready**
- Flexible audit log structure
- Normalized data for complex queries
- Views for common report needs
- Time-series data support

## 🔄 Maintenance & Backup

### **Database Maintenance**
- Automated overdue calculation
- Statistics generation ready
- Data archiving support
- Performance monitoring ready

### **Backup Strategy**
- Complete schema with constraints
- Reference data included
- Incremental backup support
- Point-in-time recovery ready

## 🚀 Scalability

### **Horizontal Scaling Ready**
- Proper indexing for read replicas
- Stateless design
- Partitioning support for large tables
- Microservices architecture compatible

### **Performance Monitoring**
- Built-in statistics table
- Audit log for performance analysis
- Index usage optimization
- Query performance ready

---

## 📝 Usage Notes

1. **First Setup**: Change default admin password
2. **Configuration**: Update system_settings table
3. **Backup**: Set up regular backup procedures
4. **Monitoring**: Implement performance monitoring
5. **Security**: Configure proper user permissions

This schema provides a robust foundation for a complete library management system with enterprise-level features and security.
