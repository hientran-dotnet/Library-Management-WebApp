-- Railway Database Schema for Library Management System
-- Modified to work with Railway's default 'railway' database

USE railway;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    CategoryID INT PRIMARY KEY AUTO_INCREMENT,
    CategoryName VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create books table with Status enum
CREATE TABLE IF NOT EXISTS books (
    BookID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(255) NOT NULL,
    Author VARCHAR(255) NOT NULL,
    ISBN VARCHAR(20) UNIQUE,
    CategoryID INT,
    PublishYear INT,
    Quantity INT DEFAULT 1,
    Description TEXT,
    ImagePath VARCHAR(500),
    Status ENUM('active', 'deleted', 'archived') DEFAULT 'active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryID) REFERENCES categories(CategoryID) ON DELETE SET NULL,
    INDEX idx_status (Status),
    INDEX idx_isbn_status (ISBN, Status),
    INDEX idx_category (CategoryID),
    INDEX idx_title (Title),
    INDEX idx_author (Author)
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
    MemberID INT PRIMARY KEY AUTO_INCREMENT,
    FullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Phone VARCHAR(20),
    Address TEXT,
    MembershipDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (Email),
    INDEX idx_status (Status)
);

-- Create borrowing table
CREATE TABLE IF NOT EXISTS borrowing (
    BorrowID INT PRIMARY KEY AUTO_INCREMENT,
    BookID INT NOT NULL,
    MemberID INT NOT NULL,
    BorrowDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DueDate TIMESTAMP NOT NULL,
    ReturnDate TIMESTAMP NULL,
    Status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    Fine DECIMAL(10,2) DEFAULT 0,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (BookID) REFERENCES books(BookID) ON DELETE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES members(MemberID) ON DELETE CASCADE,
    INDEX idx_book (BookID),
    INDEX idx_member (MemberID),
    INDEX idx_status (Status),
    INDEX idx_borrow_date (BorrowDate),
    INDEX idx_due_date (DueDate)
);

-- Insert default categories
INSERT IGNORE INTO categories (CategoryName, Description) VALUES
('Khoa học máy tính', 'Sách về lập trình, công nghệ thông tin'),
('Văn học', 'Tiểu thuyết, truyện ngắn, thơ ca'),
('Giáo dục', 'Sách giáo khoa, tài liệu học tập'),
('Kinh tế', 'Kinh doanh, quản lý, tài chính'),
('Y học', 'Y khoa, sức khỏe, chăm sóc sức khỏe'),
('Kỹ thuật', 'Kỹ thuật cơ khí, điện, xây dựng'),
('Khác', 'Các thể loại khác');

-- Insert sample books for testing
INSERT IGNORE INTO books (Title, Author, ISBN, CategoryID, PublishYear, Quantity, Description, ImagePath, Status) VALUES
('Lập trình Python cơ bản', 'Nguyễn Văn A', '978-0123456789', 1, 2023, 5, 'Hướng dẫn lập trình Python từ cơ bản đến nâng cao', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3', 'active'),
('Cơ sở dữ liệu MySQL', 'Trần Thị B', '978-0987654321', 1, 2022, 3, 'Thiết kế và quản lý cơ sở dữ liệu MySQL', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', 'active'),
('Truyện Kiều', 'Nguyễn Du', '978-1234567890', 2, 1820, 10, 'Tác phẩm văn học kinh điển Việt Nam', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', 'active'),
('Quản lý dự án', 'Lê Văn C', '978-5432167890', 4, 2021, 4, 'Phương pháp quản lý dự án hiệu quả', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'active'),
('Y học cơ bản', 'Phạm Thị D', '978-6789012345', 5, 2020, 2, 'Kiến thức y học căn bản', 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7', 'deleted');

-- Insert sample members
INSERT IGNORE INTO members (FullName, Email, Phone, Address, Status) VALUES
('Nguyễn Văn An', 'nguyenvanan@email.com', '0123456789', '123 Đường ABC, TP.HCM', 'active'),
('Trần Thị Bình', 'tranthibinh@email.com', '0987654321', '456 Đường XYZ, Hà Nội', 'active'),
('Lê Văn Cường', 'levancuong@email.com', '0369852147', '789 Đường DEF, Đà Nẵng', 'active');

-- Insert sample borrowing records
INSERT IGNORE INTO borrowing (BookID, MemberID, BorrowDate, DueDate, Status) VALUES
(1, 1, '2024-08-01 10:00:00', '2024-08-15 23:59:59', 'borrowed'),
(2, 2, '2024-08-05 14:30:00', '2024-08-19 23:59:59', 'borrowed'),
(3, 3, '2024-07-20 09:15:00', '2024-08-03 23:59:59', 'returned');

-- Create admin user table (optional)
CREATE TABLE IF NOT EXISTS admin_users (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL, -- Should be hashed
    FullName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Role ENUM('admin', 'librarian') DEFAULT 'librarian',
    Status ENUM('active', 'inactive') DEFAULT 'active',
    LastLogin TIMESTAMP NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (Username),
    INDEX idx_email (Email)
);

-- Insert default admin (password: admin123 - change in production!)
INSERT IGNORE INTO admin_users (Username, Password, FullName, Email, Role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin@library.com', 'admin');

-- Show final statistics
SELECT 
    'Categories' as TableName, 
    COUNT(*) as RecordCount 
FROM categories
UNION ALL
SELECT 
    'Books (Active)' as TableName, 
    COUNT(*) as RecordCount 
FROM books WHERE Status = 'active'
UNION ALL
SELECT 
    'Books (Deleted)' as TableName, 
    COUNT(*) as RecordCount 
FROM books WHERE Status = 'deleted'
UNION ALL
SELECT 
    'Members' as TableName, 
    COUNT(*) as RecordCount 
FROM members
UNION ALL
SELECT 
    'Borrowing Records' as TableName, 
    COUNT(*) as RecordCount 
FROM borrowing;
