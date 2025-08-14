-- =====================================================
-- QUICK SETUP SCRIPT: Fresh Installation
-- =====================================================
-- This script sets up the complete library management database from scratch
-- Use this for new installations
-- =====================================================

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS library_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE library_management_db;

-- Set SQL mode for setup
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- =====================================================
-- 1. DROP EXISTING TABLES (if any)
-- =====================================================

-- Drop in correct order to handle foreign key constraints
DROP TABLE IF EXISTS library_statistics;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS fines;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS borrowing;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS system_settings;

-- Drop views
DROP VIEW IF EXISTS vw_active_borrowings;
DROP VIEW IF EXISTS vw_overdue_books;
DROP VIEW IF EXISTS vw_member_borrowing_history;
DROP VIEW IF EXISTS vw_book_statistics;

-- Drop procedures and functions
DROP PROCEDURE IF EXISTS sp_calculate_fine;
DROP PROCEDURE IF EXISTS sp_update_book_availability;
DROP FUNCTION IF EXISTS fn_generate_member_code;

-- =====================================================
-- 2. RUN COMPLETE SCHEMA
-- =====================================================

-- Source the complete schema file
-- Note: In practice, you would run: SOURCE complete_schema.sql;
-- Or copy and paste the content from complete_schema.sql here

-- For this quick setup, we include the essential tables:

-- Categories table
CREATE TABLE categories (
    CategoryID int(11) NOT NULL AUTO_INCREMENT,
    CategoryName varchar(100) NOT NULL,
    Description text,
    CreatedDate timestamp NOT NULL DEFAULT current_timestamp(),
    Status enum('active','inactive') DEFAULT 'active',
    PRIMARY KEY (CategoryID),
    UNIQUE KEY uk_category_name (CategoryName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Books table
CREATE TABLE books (
    BookID int(11) NOT NULL AUTO_INCREMENT,
    Title varchar(255) NOT NULL,
    Author varchar(255) NOT NULL,
    ISBN varchar(20) DEFAULT NULL,
    CategoryID int(11) DEFAULT NULL,
    PublishYear year(4) DEFAULT NULL,
    Publisher varchar(255) DEFAULT NULL,
    Edition varchar(50) DEFAULT NULL,
    Pages int(11) DEFAULT NULL,
    Language varchar(50) DEFAULT 'Vietnamese',
    Quantity int(11) NOT NULL DEFAULT 1,
    AvailableQuantity int(11) NOT NULL DEFAULT 1,
    Location varchar(100) DEFAULT NULL,
    Description text,
    ImagePath varchar(500) DEFAULT NULL,
    CreatedDate timestamp NOT NULL DEFAULT current_timestamp(),
    UpdatedDate timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    Status enum('active','inactive','maintenance') DEFAULT 'active',
    PRIMARY KEY (BookID),
    UNIQUE KEY uk_isbn (ISBN),
    KEY idx_title (Title),
    KEY idx_author (Author),
    KEY idx_category (CategoryID),
    KEY idx_status (Status),
    CONSTRAINT fk_books_category FOREIGN KEY (CategoryID) REFERENCES categories (CategoryID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Members table
CREATE TABLE members (
    MemberID int(11) NOT NULL AUTO_INCREMENT,
    MemberCode varchar(20) NOT NULL,
    FullName varchar(255) NOT NULL,
    Email varchar(255) DEFAULT NULL,
    Phone varchar(20) DEFAULT NULL,
    Address text,
    DateOfBirth date DEFAULT NULL,
    Gender enum('Male','Female','Other') DEFAULT NULL,
    MembershipDate date NOT NULL DEFAULT (curdate()),
    ExpiryDate date DEFAULT NULL,
    MembershipType enum('student','teacher','staff','public') DEFAULT 'public',
    EmergencyContact varchar(255) DEFAULT NULL,
    EmergencyPhone varchar(20) DEFAULT NULL,
    CreatedDate timestamp NOT NULL DEFAULT current_timestamp(),
    UpdatedDate timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    Status enum('active','suspended','expired','inactive') DEFAULT 'active',
    PRIMARY KEY (MemberID),
    UNIQUE KEY uk_member_code (MemberCode),
    UNIQUE KEY uk_member_email (Email),
    KEY idx_fullname (FullName),
    KEY idx_membership_type (MembershipType),
    KEY idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Borrowing table
CREATE TABLE borrowing (
    BorrowID int(11) NOT NULL AUTO_INCREMENT,
    BookID int(11) NOT NULL,
    MemberID int(11) NOT NULL,
    BorrowDate datetime NOT NULL DEFAULT current_timestamp(),
    DueDate datetime NOT NULL,
    ReturnDate datetime DEFAULT NULL,
    ActualReturnDate datetime DEFAULT NULL,
    RenewalCount int(11) DEFAULT 0,
    Fine decimal(10,2) DEFAULT 0.00,
    AdminID int(11) DEFAULT NULL,
    Notes text,
    CreatedDate timestamp NOT NULL DEFAULT current_timestamp(),
    UpdatedDate timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    Status enum('borrowed','returned','overdue','lost','renewed') DEFAULT 'borrowed',
    PRIMARY KEY (BorrowID),
    KEY idx_book_member (BookID,MemberID),
    KEY idx_borrow_date (BorrowDate),
    KEY idx_due_date (DueDate),
    KEY idx_status (Status),
    CONSTRAINT fk_borrowing_book FOREIGN KEY (BookID) REFERENCES books (BookID) ON DELETE CASCADE,
    CONSTRAINT fk_borrowing_member FOREIGN KEY (MemberID) REFERENCES members (MemberID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin users table
CREATE TABLE admin_users (
    AdminID int(11) NOT NULL AUTO_INCREMENT,
    Username varchar(50) NOT NULL,
    Email varchar(255) NOT NULL,
    PasswordHash varchar(255) NOT NULL,
    FullName varchar(255) NOT NULL,
    Role enum('super_admin','admin','librarian','staff') DEFAULT 'staff',
    LastLogin datetime DEFAULT NULL,
    LoginAttempts int(11) DEFAULT 0,
    AccountLocked tinyint(1) DEFAULT 0,
    CreatedDate timestamp NOT NULL DEFAULT current_timestamp(),
    UpdatedDate timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    Status enum('active','inactive','suspended') DEFAULT 'active',
    PRIMARY KEY (AdminID),
    UNIQUE KEY uk_username (Username),
    UNIQUE KEY uk_admin_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System settings table
CREATE TABLE system_settings (
    SettingID int(11) NOT NULL AUTO_INCREMENT,
    SettingKey varchar(100) NOT NULL,
    SettingValue text,
    Description text,
    DataType enum('string','number','boolean','json') DEFAULT 'string',
    Category varchar(50) DEFAULT 'general',
    CreatedDate timestamp NOT NULL DEFAULT current_timestamp(),
    UpdatedDate timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (SettingID),
    UNIQUE KEY uk_setting_key (SettingKey)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. CREATE ESSENTIAL TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger to update available quantity when borrowing
CREATE TRIGGER tr_borrowing_insert 
AFTER INSERT ON borrowing
FOR EACH ROW
BEGIN
    IF NEW.Status = 'borrowed' THEN
        UPDATE books 
        SET AvailableQuantity = AvailableQuantity - 1 
        WHERE BookID = NEW.BookID AND AvailableQuantity > 0;
    END IF;
END//

-- Trigger to update available quantity when returning
CREATE TRIGGER tr_borrowing_update 
AFTER UPDATE ON borrowing
FOR EACH ROW
BEGIN
    -- If status changed from borrowed to returned
    IF OLD.Status = 'borrowed' AND NEW.Status = 'returned' THEN
        UPDATE books 
        SET AvailableQuantity = AvailableQuantity + 1 
        WHERE BookID = NEW.BookID;
    -- If status changed from returned to borrowed
    ELSEIF OLD.Status = 'returned' AND NEW.Status = 'borrowed' THEN
        UPDATE books 
        SET AvailableQuantity = AvailableQuantity - 1 
        WHERE BookID = NEW.BookID AND AvailableQuantity > 0;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- 4. INSERT BASIC DATA
-- =====================================================

-- Insert basic categories
INSERT INTO categories (CategoryName, Description) VALUES
('Công nghệ thông tin', 'Sách về lập trình, phần mềm, mạng máy tính'),
('Kinh tế', 'Sách về kinh tế học, quản lý, tài chính'),
('Văn học', 'Tiểu thuyết, thơ ca, văn học trong nước và nước ngoài'),
('Khoa học', 'Toán học, vật lý, hóa học, sinh học'),
('Lịch sử', 'Lịch sử Việt Nam và thế giới'),
('Ngoại ngữ', 'Sách học tiếng Anh, tiếng Nhật, tiếng Trung'),
('Tâm lý - Kỹ năng sống', 'Phát triển bản thân, kỹ năng mềm'),
('Khác', 'Các loại sách khác');

-- Insert system settings
INSERT INTO system_settings (SettingKey, SettingValue, Description, DataType, Category) VALUES
('library_name', 'Thư viện Quản lý', 'Tên thư viện', 'string', 'general'),
('max_borrow_days', '14', 'Số ngày mượn tối đa', 'number', 'borrowing'),
('max_renewal_times', '2', 'Số lần gia hạn tối đa', 'number', 'borrowing'),
('fine_per_day', '5000', 'Phí phạt mỗi ngày (VND)', 'number', 'fines'),
('max_books_per_member', '5', 'Số sách tối đa mỗi thành viên có thể mượn', 'number', 'borrowing'),
('library_email', 'library@example.com', 'Email thư viện', 'string', 'contact'),
('library_phone', '0123456789', 'Số điện thoại thư viện', 'string', 'contact'),
('library_address', '123 Đường ABC, Quận XYZ, TP.HCM', 'Địa chỉ thư viện', 'string', 'contact');

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (Username, Email, PasswordHash, FullName, Role) VALUES
('admin', 'admin@library.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'super_admin');

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Check tables
SELECT 'Setup Verification' as Title;
SELECT 
    'categories' as TableName, COUNT(*) as RecordCount FROM categories
UNION ALL
SELECT 'system_settings', COUNT(*) FROM system_settings
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;

-- Show table structure
SHOW TABLES;

-- Commit transaction
COMMIT;

-- Reset SQL mode
SET SQL_MODE = '';

-- Final message
SELECT 'Quick setup completed successfully!' as Status;
SELECT 'You can now start using the library management system.' as Note;
SELECT 'Default admin: username=admin, password=admin123' as LoginInfo;
