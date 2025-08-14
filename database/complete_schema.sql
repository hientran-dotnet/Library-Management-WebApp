-- =====================================================
-- LIBRARY MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Created: August 2025
-- Version: 2.0
-- Description: Complete database schema for Library Management System
--             with proper relationships, constraints, and indexing
-- =====================================================

-- Drop existing database if exists (use with caution in production)
-- DROP DATABASE IF EXISTS library_management;

-- Create database
-- CREATE DATABASE library_management 
-- CHARACTER SET utf8mb4 
-- COLLATE utf8mb4_unicode_ci;

-- USE library_management;

-- =====================================================
-- 1. CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_category_name (CategoryName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. BOOKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS books (
    BookID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Author VARCHAR(255) NOT NULL,
    ISBN VARCHAR(20) UNIQUE,
    CategoryID INT,
    PublishYear YEAR,
    Publisher VARCHAR(255),
    Quantity INT NOT NULL DEFAULT 1,
    AvailableQuantity INT NOT NULL DEFAULT 1,
    Description TEXT,
    ImagePath VARCHAR(500),
    Location VARCHAR(100), -- Shelf location in library
    Price DECIMAL(10,2),
    Status ENUM('active', 'deleted', 'archived', 'maintenance') NOT NULL DEFAULT 'active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (CategoryID) REFERENCES categories(CategoryID) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_quantity CHECK (Quantity >= 0),
    CONSTRAINT chk_available_quantity CHECK (AvailableQuantity >= 0 AND AvailableQuantity <= Quantity),
    CONSTRAINT chk_publish_year CHECK (PublishYear >= 1000 AND PublishYear <= YEAR(CURDATE()) + 1),
    CONSTRAINT chk_price CHECK (Price >= 0),
    
    -- Indexes
    INDEX idx_title (Title),
    INDEX idx_author (Author),
    INDEX idx_isbn (ISBN),
    INDEX idx_category (CategoryID),
    INDEX idx_status (Status),
    INDEX idx_status_title (Status, Title),
    INDEX idx_author_title (Author, Title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS members (
    MemberID INT AUTO_INCREMENT PRIMARY KEY,
    MemberCode VARCHAR(20) UNIQUE NOT NULL,
    FullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE,
    Phone VARCHAR(20),
    Address TEXT,
    DateOfBirth DATE,
    Gender ENUM('male', 'female', 'other'),
    IdentityCard VARCHAR(20) UNIQUE,
    MembershipType ENUM('standard', 'premium', 'vip') NOT NULL DEFAULT 'standard',
    MembershipDate DATE NOT NULL DEFAULT (CURDATE()),
    ExpiryDate DATE,
    Status ENUM('active', 'inactive', 'suspended', 'expired') NOT NULL DEFAULT 'active',
    MaxBorrowBooks INT NOT NULL DEFAULT 5,
    MaxBorrowDays INT NOT NULL DEFAULT 14,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Check Constraints
    CONSTRAINT chk_email_format CHECK (Email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (Phone REGEXP '^[0-9+\\-\\s()]+$'),
    CONSTRAINT chk_max_borrow_books CHECK (MaxBorrowBooks > 0 AND MaxBorrowBooks <= 50),
    CONSTRAINT chk_max_borrow_days CHECK (MaxBorrowDays > 0 AND MaxBorrowDays <= 365),
    CONSTRAINT chk_expiry_after_membership CHECK (ExpiryDate IS NULL OR ExpiryDate >= MembershipDate),
    
    -- Indexes
    INDEX idx_member_code (MemberCode),
    INDEX idx_fullname (FullName),
    INDEX idx_email (Email),
    INDEX idx_phone (Phone),
    INDEX idx_status (Status),
    INDEX idx_membership_type (MembershipType),
    INDEX idx_status_name (Status, FullName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. BORROWING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS borrowing (
    BorrowID INT AUTO_INCREMENT PRIMARY KEY,
    BookID INT NOT NULL,
    MemberID INT NOT NULL,
    BorrowDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DueDate DATETIME NOT NULL,
    ReturnDate DATETIME NULL,
    ActualReturnDate DATETIME NULL,
    Status ENUM('borrowed', 'returned', 'overdue', 'lost', 'damaged') NOT NULL DEFAULT 'borrowed',
    Fine DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FineReason VARCHAR(255),
    RenewalCount INT NOT NULL DEFAULT 0,
    Notes TEXT,
    LibrarianID INT, -- ID of librarian who processed the transaction
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (BookID) REFERENCES books(BookID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES members(MemberID) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_due_after_borrow CHECK (DueDate > BorrowDate),
    CONSTRAINT chk_return_after_borrow CHECK (ReturnDate IS NULL OR ReturnDate >= BorrowDate),
    CONSTRAINT chk_actual_return_after_borrow CHECK (ActualReturnDate IS NULL OR ActualReturnDate >= BorrowDate),
    CONSTRAINT chk_fine CHECK (Fine >= 0),
    CONSTRAINT chk_renewal_count CHECK (RenewalCount >= 0 AND RenewalCount <= 10),
    
    -- Indexes
    INDEX idx_book_id (BookID),
    INDEX idx_member_id (MemberID),
    INDEX idx_borrow_date (BorrowDate),
    INDEX idx_due_date (DueDate),
    INDEX idx_return_date (ReturnDate),
    INDEX idx_status (Status),
    INDEX idx_status_date (Status, BorrowDate),
    INDEX idx_member_status (MemberID, Status),
    INDEX idx_book_status (BookID, Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. RESERVATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reservations (
    ReservationID INT AUTO_INCREMENT PRIMARY KEY,
    BookID INT NOT NULL,
    MemberID INT NOT NULL,
    ReservationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpiryDate DATETIME NOT NULL,
    Status ENUM('active', 'fulfilled', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
    NotificationSent BOOLEAN NOT NULL DEFAULT FALSE,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (BookID) REFERENCES books(BookID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES members(MemberID) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_expiry_after_reservation CHECK (ExpiryDate > ReservationDate),
    
    -- Unique Constraints
    UNIQUE KEY unique_active_reservation (BookID, MemberID, Status),
    
    -- Indexes
    INDEX idx_book_id_res (BookID),
    INDEX idx_member_id_res (MemberID),
    INDEX idx_reservation_date (ReservationDate),
    INDEX idx_expiry_date (ExpiryDate),
    INDEX idx_status_res (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. ADMIN USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL, -- Store hashed passwords
    FullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Phone VARCHAR(20),
    Role ENUM('admin', 'librarian', 'assistant') NOT NULL DEFAULT 'librarian',
    Status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    LastLogin DATETIME NULL,
    LoginAttempts INT NOT NULL DEFAULT 0,
    LockedUntil DATETIME NULL,
    PasswordChangedAt DATETIME NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Check Constraints
    CONSTRAINT chk_username_length CHECK (CHAR_LENGTH(Username) >= 3),
    CONSTRAINT chk_password_length CHECK (CHAR_LENGTH(Password) >= 60), -- For bcrypt hashes
    CONSTRAINT chk_email_format_admin CHECK (Email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_login_attempts CHECK (LoginAttempts >= 0 AND LoginAttempts <= 10),
    
    -- Indexes
    INDEX idx_username (Username),
    INDEX idx_email_admin (Email),
    INDEX idx_role (Role),
    INDEX idx_status_admin (Status),
    INDEX idx_last_login (LastLogin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. FINES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS fines (
    FineID INT AUTO_INCREMENT PRIMARY KEY,
    BorrowID INT NOT NULL,
    MemberID INT NOT NULL,
    FineType ENUM('overdue', 'damage', 'lost', 'other') NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    AmountPaid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    Status ENUM('pending', 'paid', 'waived', 'partial') NOT NULL DEFAULT 'pending',
    Description TEXT,
    DueDate DATE,
    PaidDate DATETIME NULL,
    WaivedDate DATETIME NULL,
    WaivedBy INT NULL, -- AdminID who waived the fine
    WaivedReason TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (BorrowID) REFERENCES borrowing(BorrowID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES members(MemberID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (WaivedBy) REFERENCES admin_users(AdminID) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_amount CHECK (Amount >= 0),
    CONSTRAINT chk_amount_paid CHECK (AmountPaid >= 0 AND AmountPaid <= Amount),
    
    -- Indexes
    INDEX idx_borrow_id_fine (BorrowID),
    INDEX idx_member_id_fine (MemberID),
    INDEX idx_fine_type (FineType),
    INDEX idx_status_fine (Status),
    INDEX idx_due_date_fine (DueDate),
    INDEX idx_paid_date (PaidDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    TableName VARCHAR(50) NOT NULL,
    RecordID INT NOT NULL,
    Action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    OldValues JSON,
    NewValues JSON,
    ChangedBy INT, -- AdminID
    ChangedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IPAddress VARCHAR(45),
    UserAgent TEXT,
    
    -- Foreign Key Constraints
    FOREIGN KEY (ChangedBy) REFERENCES admin_users(AdminID) ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_table_name (TableName),
    INDEX idx_record_id (RecordID),
    INDEX idx_action (Action),
    INDEX idx_changed_by (ChangedBy),
    INDEX idx_changed_at (ChangedAt),
    INDEX idx_table_record (TableName, RecordID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
    SettingID INT AUTO_INCREMENT PRIMARY KEY,
    SettingKey VARCHAR(100) UNIQUE NOT NULL,
    SettingValue TEXT NOT NULL,
    Description TEXT,
    DataType ENUM('string', 'integer', 'decimal', 'boolean', 'date', 'json') NOT NULL DEFAULT 'string',
    IsEditable BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_setting_key (SettingKey),
    INDEX idx_is_editable (IsEditable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. LIBRARY STATISTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS library_statistics (
    StatID INT AUTO_INCREMENT PRIMARY KEY,
    StatDate DATE NOT NULL,
    TotalBooks INT NOT NULL DEFAULT 0,
    TotalMembers INT NOT NULL DEFAULT 0,
    ActiveMembers INT NOT NULL DEFAULT 0,
    BooksIssued INT NOT NULL DEFAULT 0,
    BooksReturned INT NOT NULL DEFAULT 0,
    OverdueBooks INT NOT NULL DEFAULT 0,
    NewMembersAdded INT NOT NULL DEFAULT 0,
    FinesCollected DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique Constraints
    UNIQUE KEY unique_stat_date (StatDate),
    
    -- Check Constraints
    CONSTRAINT chk_stat_counters CHECK (
        TotalBooks >= 0 AND 
        TotalMembers >= 0 AND 
        ActiveMembers >= 0 AND 
        BooksIssued >= 0 AND 
        BooksReturned >= 0 AND 
        OverdueBooks >= 0 AND 
        NewMembersAdded >= 0 AND 
        FinesCollected >= 0 AND
        ActiveMembers <= TotalMembers
    ),
    
    -- Indexes
    INDEX idx_stat_date (StatDate),
    INDEX idx_created_at_stat (CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATING AVAILABLE QUANTITY
-- =====================================================

-- Trigger to update available quantity when borrowing
DELIMITER //
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
        WHERE BookID = NEW.BookID AND AvailableQuantity < Quantity;
    -- If status changed from returned to borrowed
    ELSEIF OLD.Status = 'returned' AND NEW.Status = 'borrowed' THEN
        UPDATE books 
        SET AvailableQuantity = AvailableQuantity - 1 
        WHERE BookID = NEW.BookID AND AvailableQuantity > 0;
    END IF;
END//

-- Trigger to restore available quantity when borrowing record is deleted
CREATE TRIGGER tr_borrowing_delete 
AFTER DELETE ON borrowing
FOR EACH ROW
BEGIN
    IF OLD.Status = 'borrowed' THEN
        UPDATE books 
        SET AvailableQuantity = AvailableQuantity + 1 
        WHERE BookID = OLD.BookID AND AvailableQuantity < Quantity;
    END IF;
END//

-- Trigger to update available quantity when book quantity changes
CREATE TRIGGER tr_books_update_quantity 
BEFORE UPDATE ON books
FOR EACH ROW
BEGIN
    -- Ensure AvailableQuantity doesn't exceed new Quantity
    IF NEW.Quantity < OLD.Quantity THEN
        SET NEW.AvailableQuantity = LEAST(NEW.AvailableQuantity, NEW.Quantity);
    END IF;
    
    -- If quantity increased, adjust available quantity proportionally
    IF NEW.Quantity > OLD.Quantity AND OLD.Quantity > 0 THEN
        SET NEW.AvailableQuantity = NEW.AvailableQuantity + (NEW.Quantity - OLD.Quantity);
    END IF;
END//

DELIMITER ;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for available books
CREATE OR REPLACE VIEW view_available_books AS
SELECT 
    b.BookID,
    b.Title,
    b.Author,
    b.ISBN,
    c.CategoryName,
    b.Quantity,
    b.AvailableQuantity,
    b.PublishYear,
    b.Publisher,
    b.Location,
    b.Status
FROM books b
LEFT JOIN categories c ON b.CategoryID = c.CategoryID
WHERE b.Status = 'active' AND b.AvailableQuantity > 0;

-- View for current borrowings
CREATE OR REPLACE VIEW view_current_borrowings AS
SELECT 
    br.BorrowID,
    b.Title,
    b.Author,
    m.FullName,
    m.Email,
    br.BorrowDate,
    br.DueDate,
    br.Status,
    br.Fine,
    DATEDIFF(CURDATE(), br.DueDate) as DaysOverdue
FROM borrowing br
JOIN books b ON br.BookID = b.BookID
JOIN members m ON br.MemberID = m.MemberID
WHERE br.Status IN ('borrowed', 'overdue');

-- View for member statistics
CREATE OR REPLACE VIEW view_member_statistics AS
SELECT 
    m.MemberID,
    m.MemberCode,
    m.FullName,
    m.Status,
    COUNT(br.BorrowID) as TotalBorrowings,
    COUNT(CASE WHEN br.Status = 'borrowed' THEN 1 END) as CurrentBorrowings,
    COUNT(CASE WHEN br.Status = 'overdue' THEN 1 END) as OverdueBooks,
    COALESCE(SUM(br.Fine), 0) as TotalFines
FROM members m
LEFT JOIN borrowing br ON m.MemberID = br.MemberID
GROUP BY m.MemberID, m.MemberCode, m.FullName, m.Status;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Procedure to calculate overdue books and update fines
DELIMITER //
CREATE PROCEDURE sp_update_overdue_books()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_borrow_id INT;
    DECLARE v_days_overdue INT;
    DECLARE v_fine_amount DECIMAL(10,2);
    DECLARE v_fine_per_day DECIMAL(10,2) DEFAULT 5000.00; -- Default fine per day
    
    -- Cursor to get overdue borrowings
    DECLARE cur_overdue CURSOR FOR
        SELECT BorrowID, DATEDIFF(CURDATE(), DueDate) as DaysOverdue
        FROM borrowing 
        WHERE Status = 'borrowed' 
        AND DueDate < CURDATE();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur_overdue;
    
    overdue_loop: LOOP
        FETCH cur_overdue INTO v_borrow_id, v_days_overdue;
        
        IF done THEN
            LEAVE overdue_loop;
        END IF;
        
        -- Calculate fine amount
        SET v_fine_amount = v_days_overdue * v_fine_per_day;
        
        -- Update borrowing status and fine
        UPDATE borrowing 
        SET Status = 'overdue', 
            Fine = v_fine_amount,
            FineReason = CONCAT('Overdue by ', v_days_overdue, ' days')
        WHERE BorrowID = v_borrow_id;
        
    END LOOP;
    
    CLOSE cur_overdue;
END//

-- Procedure to generate member code
CREATE PROCEDURE sp_generate_member_code(OUT new_member_code VARCHAR(20))
BEGIN
    DECLARE code_exists INT DEFAULT 1;
    DECLARE counter INT DEFAULT 1;
    DECLARE temp_code VARCHAR(20);
    
    WHILE code_exists > 0 DO
        SET temp_code = CONCAT('MEM', YEAR(CURDATE()), LPAD(counter, 6, '0'));
        
        SELECT COUNT(*) INTO code_exists 
        FROM members 
        WHERE MemberCode = temp_code;
        
        IF code_exists = 0 THEN
            SET new_member_code = temp_code;
        ELSE
            SET counter = counter + 1;
        END IF;
    END WHILE;
END//

DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_books_category_status ON books(CategoryID, Status);
CREATE INDEX idx_borrowing_member_status_date ON borrowing(MemberID, Status, BorrowDate);
CREATE INDEX idx_members_status_membership ON members(Status, MembershipType);

-- Full-text search indexes
-- ALTER TABLE books ADD FULLTEXT(Title, Author, Description);

-- =====================================================
-- INITIAL SYSTEM SETTINGS
-- =====================================================
INSERT IGNORE INTO system_settings (SettingKey, SettingValue, Description, DataType) VALUES
('library_name', 'Thư Viện Trung Tâm', 'Tên của thư viện', 'string'),
('max_borrow_days', '14', 'Số ngày mượn tối đa mặc định', 'integer'),
('max_borrow_books', '5', 'Số sách mượn tối đa mặc định', 'integer'),
('fine_per_day', '5000', 'Tiền phạt mỗi ngày trễ hạn (VND)', 'decimal'),
('max_renewal_count', '2', 'Số lần gia hạn tối đa', 'integer'),
('reservation_expiry_days', '3', 'Số ngày hết hạn đặt chỗ', 'integer'),
('library_email', 'library@example.com', 'Email liên hệ của thư viện', 'string'),
('library_phone', '0123456789', 'Số điện thoại thư viện', 'string'),
('library_address', '123 Đường ABC, Quận XYZ, TP. HCM', 'Địa chỉ thư viện', 'string'),
('auto_calculate_fines', 'true', 'Tự động tính phạt cho sách quá hạn', 'boolean'),
('send_email_notifications', 'true', 'Gửi thông báo email', 'boolean'),
('backup_frequency', 'daily', 'Tần suất sao lưu dữ liệu', 'string');

-- =====================================================
-- INITIAL ADMIN USER
-- =====================================================
-- Default admin user (password should be changed after first login)
-- Password: admin123 (hashed with bcrypt)
INSERT IGNORE INTO admin_users (Username, Password, FullName, Email, Role, Status) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin@library.com', 'admin', 'active');

-- =====================================================
-- END OF SCHEMA CREATION
-- =====================================================

-- Display completion message
SELECT 'Library Management System database schema created successfully!' as Message;
SELECT 'Remember to:' as Reminder;
SELECT '1. Change default admin password' as Step1;
SELECT '2. Update system settings as needed' as Step2;
SELECT '3. Configure backup procedures' as Step3;
SELECT '4. Set up proper user permissions' as Step4;
