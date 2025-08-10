-- Update books table structure for multi-level status system
-- Remove old IsDeleted column and add Status column

-- Add Status column with proper enum values
ALTER TABLE books ADD COLUMN Status ENUM('active', 'deleted', 'archived') DEFAULT 'active' AFTER Description;

-- Add indexes for better performance
ALTER TABLE books ADD INDEX idx_status (Status);
ALTER TABLE books ADD INDEX idx_isbn_status (ISBN, Status);

-- Drop the old IsDeleted column (if exists)
-- ALTER TABLE books DROP COLUMN IsDeleted;

-- Update the table structure to be more consistent
ALTER TABLE books MODIFY COLUMN CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE books MODIFY COLUMN UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Insert sample data for testing
INSERT INTO books (Title, Author, CategoryID, ISBN, Quantity, PublishYear, Description, ImagePath, Status) VALUES
('Lập trình Web với PHP và MySQL', 'Nguyễn Văn A', 1, '978-0-123456-78-9', 15, 2023, 'Sách hướng dẫn lập trình web cơ bản với PHP và MySQL', 'images/php-mysql.jpg', 'active'),
('JavaScript từ cơ bản đến nâng cao', 'Trần Thị B', 1, '978-0-123456-79-6', 10, 2022, 'Sách học JavaScript toàn diện', 'images/javascript.jpg', 'active'),
('Cơ sở dữ liệu MySQL', 'Lê Văn C', 1, '978-0-123456-80-2', 8, 2023, 'Hướng dẫn quản trị MySQL chuyên nghiệp', 'images/mysql.jpg', 'active'),
('HTML5 và CSS3 hiện đại', 'Phạm Thị D', 1, '978-0-123456-81-9', 12, 2023, 'Thiết kế web với HTML5 và CSS3', 'images/html-css.jpg', 'active'),
('Python cho người mới bắt đầu', 'Hoàng Văn E', 2, '978-0-123456-82-6', 20, 2023, 'Học Python từ cơ bản', 'images/python.jpg', 'active'),
('React.js trong thực tế', 'Vũ Thị F', 1, '978-0-123456-83-3', 7, 2022, 'Xây dựng ứng dụng web với React', 'images/react.jpg', 'deleted'),
('Node.js Backend Development', 'Đỗ Văn G', 1, '978-0-123456-84-0', 0, 2021, 'Phát triển backend với Node.js', 'images/nodejs.jpg', 'archived'),
('Vue.js Complete Guide', 'Bùi Thị H', 1, '978-0-123456-85-7', 5, 2023, 'Hướng dẫn Vue.js toàn diện', 'images/vuejs.jpg', 'active');
