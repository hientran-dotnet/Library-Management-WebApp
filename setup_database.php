<?php
// Create database tables for Railway
header('Content-Type: application/json');

// Include config
require_once 'includes/config.php';

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => 'failed',
    'message' => '',
    'tables_created' => []
];

try {
    // Connect without specifying database first
    $dsn_no_db = "mysql:host=$host;port=$port;charset=utf8mb4";
    $pdo = new PDO($dsn_no_db, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 30
    ]);
    
    // Use railway database
    $pdo->exec("USE $db_name");
    
    // Create categories table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS categories (
            CategoryID INT PRIMARY KEY AUTO_INCREMENT,
            CategoryName VARCHAR(100) NOT NULL UNIQUE,
            Description TEXT,
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    $result['tables_created'][] = 'categories';
    
    // Create books table
    $pdo->exec("
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
        )
    ");
    $result['tables_created'][] = 'books';
    
    // Create members table
    $pdo->exec("
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
        )
    ");
    $result['tables_created'][] = 'members';
    
    // Create borrowing table
    $pdo->exec("
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
        )
    ");
    $result['tables_created'][] = 'borrowing';
    
    // Insert sample data
    $pdo->exec("
        INSERT IGNORE INTO categories (CategoryName, Description) VALUES
        ('Khoa học máy tính', 'Sách về lập trình, công nghệ thông tin'),
        ('Văn học', 'Tiểu thuyết, truyện ngắn, thơ ca'),
        ('Giáo dục', 'Sách giáo khoa, tài liệu học tập'),
        ('Kinh tế', 'Kinh doanh, quản lý, tài chính'),
        ('Y học', 'Y khoa, sức khỏe, chăm sóc sức khỏe'),
        ('Kỹ thuật', 'Kỹ thuật cơ khí, điện, xây dựng'),
        ('Khác', 'Các thể loại khác')
    ");
    
    $pdo->exec("
        INSERT IGNORE INTO books (Title, Author, ISBN, CategoryID, PublishYear, Quantity, Description, ImagePath, Status) VALUES
        ('Lập trình Python cơ bản', 'Nguyễn Văn A', '978-0123456789', 1, 2023, 5, 'Hướng dẫn lập trình Python từ cơ bản đến nâng cao', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3', 'active'),
        ('Cơ sở dữ liệu MySQL', 'Trần Thị B', '978-0987654321', 1, 2022, 3, 'Thiết kế và quản lý cơ sở dữ liệu MySQL', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', 'active'),
        ('Truyện Kiều', 'Nguyễn Du', '978-1234567890', 2, 1820, 10, 'Tác phẩm văn học kinh điển Việt Nam', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570', 'active'),
        ('Quản lý dự án', 'Lê Văn C', '978-5432167890', 4, 2021, 4, 'Phương pháp quản lý dự án hiệu quả', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'active'),
        ('Y học cơ bản', 'Phạm Thị D', '978-6789012345', 5, 2020, 2, 'Kiến thức y học căn bản', 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7', 'deleted')
    ");
    
    $result['status'] = 'success';
    $result['message'] = 'All tables created successfully with sample data';
    
} catch (Exception $e) {
    $result['message'] = $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>
