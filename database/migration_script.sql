-- =====================================================
-- MIGRATION SCRIPT: Legacy to Complete Schema
-- =====================================================
-- This script migrates from the old simple schema to the complete schema
-- Run this AFTER creating the complete schema if you have existing data
-- =====================================================

-- Set SQL mode for migration
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- =====================================================
-- 1. BACKUP EXISTING DATA (if any)
-- =====================================================

-- Create backup tables
CREATE TABLE IF NOT EXISTS books_backup AS SELECT * FROM books WHERE 1=0;
CREATE TABLE IF NOT EXISTS members_backup AS SELECT * FROM members WHERE 1=0;
CREATE TABLE IF NOT EXISTS borrowing_backup AS SELECT * FROM borrowing WHERE 1=0;

-- Backup existing data
INSERT INTO books_backup SELECT * FROM books;
INSERT INTO members_backup SELECT * FROM members;  
INSERT INTO borrowing_backup SELECT * FROM borrowing;

-- =====================================================
-- 2. MIGRATION PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to migrate books data
CREATE PROCEDURE sp_migrate_books()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_book_id INT;
    DECLARE v_title VARCHAR(255);
    DECLARE v_author VARCHAR(255);
    DECLARE v_isbn VARCHAR(20);
    DECLARE v_category_id INT;
    DECLARE v_publish_year YEAR;
    DECLARE v_quantity INT;
    DECLARE v_description TEXT;
    DECLARE v_image_path VARCHAR(500);
    DECLARE v_status VARCHAR(20);
    
    -- Cursor for existing books
    DECLARE cur_books CURSOR FOR
        SELECT BookID, Title, Author, ISBN, CategoryID, PublishYear, 
               Quantity, Description, ImagePath, Status
        FROM books_backup;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Clear existing books
    DELETE FROM books;
    
    OPEN cur_books;
    
    books_loop: LOOP
        FETCH cur_books INTO v_book_id, v_title, v_author, v_isbn, 
                            v_category_id, v_publish_year, v_quantity, 
                            v_description, v_image_path, v_status;
        
        IF done THEN
            LEAVE books_loop;
        END IF;
        
        -- Insert with new schema
        INSERT INTO books (
            BookID, Title, Author, ISBN, CategoryID, PublishYear,
            Quantity, AvailableQuantity, Description, ImagePath, Status
        ) VALUES (
            v_book_id, v_title, v_author, v_isbn, v_category_id, v_publish_year,
            COALESCE(v_quantity, 1), COALESCE(v_quantity, 1), 
            v_description, v_image_path, COALESCE(v_status, 'active')
        );
        
    END LOOP;
    
    CLOSE cur_books;
END//

-- Procedure to migrate members data
CREATE PROCEDURE sp_migrate_members()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_member_id INT;
    DECLARE v_full_name VARCHAR(255);
    DECLARE v_email VARCHAR(255);
    DECLARE v_phone VARCHAR(20);
    DECLARE v_address TEXT;
    DECLARE v_membership_date DATE;
    DECLARE v_status VARCHAR(20);
    DECLARE v_member_code VARCHAR(20);
    
    -- Cursor for existing members
    DECLARE cur_members CURSOR FOR
        SELECT MemberID, FullName, Email, Phone, Address, MembershipDate, Status
        FROM members_backup;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Clear existing members
    DELETE FROM members;
    
    OPEN cur_members;
    
    members_loop: LOOP
        FETCH cur_members INTO v_member_id, v_full_name, v_email, v_phone, 
                              v_address, v_membership_date, v_status;
        
        IF done THEN
            LEAVE members_loop;
        END IF;
        
        -- Generate member code
        SET v_member_code = CONCAT('MEM', YEAR(COALESCE(v_membership_date, CURDATE())), 
                                   LPAD(v_member_id, 6, '0'));
        
        -- Insert with new schema
        INSERT INTO members (
            MemberID, MemberCode, FullName, Email, Phone, Address,
            MembershipDate, Status
        ) VALUES (
            v_member_id, v_member_code, v_full_name, v_email, v_phone, v_address,
            COALESCE(v_membership_date, CURDATE()), COALESCE(v_status, 'active')
        );
        
    END LOOP;
    
    CLOSE cur_members;
END//

-- Procedure to migrate borrowing data  
CREATE PROCEDURE sp_migrate_borrowing()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_borrow_id INT;
    DECLARE v_book_id INT;
    DECLARE v_member_id INT;
    DECLARE v_borrow_date DATETIME;
    DECLARE v_due_date DATETIME;
    DECLARE v_return_date DATETIME;
    DECLARE v_status VARCHAR(20);
    DECLARE v_fine DECIMAL(10,2);
    DECLARE v_notes TEXT;
    
    -- Cursor for existing borrowing
    DECLARE cur_borrowing CURSOR FOR
        SELECT BorrowID, BookID, MemberID, BorrowDate, DueDate, 
               ReturnDate, Status, Fine, Notes
        FROM borrowing_backup;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Clear existing borrowing
    DELETE FROM borrowing;
    
    OPEN cur_borrowing;
    
    borrowing_loop: LOOP
        FETCH cur_borrowing INTO v_borrow_id, v_book_id, v_member_id, 
                                v_borrow_date, v_due_date, v_return_date, 
                                v_status, v_fine, v_notes;
        
        IF done THEN
            LEAVE borrowing_loop;
        END IF;
        
        -- Insert with new schema
        INSERT INTO borrowing (
            BorrowID, BookID, MemberID, BorrowDate, DueDate, 
            ReturnDate, ActualReturnDate, Status, Fine, Notes
        ) VALUES (
            v_borrow_id, v_book_id, v_member_id, v_borrow_date, v_due_date,
            v_return_date, v_return_date, COALESCE(v_status, 'borrowed'), 
            COALESCE(v_fine, 0), v_notes
        );
        
    END LOOP;
    
    CLOSE cur_borrowing;
END//

-- Procedure to fix available quantities
CREATE PROCEDURE sp_fix_available_quantities()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_book_id INT;
    DECLARE v_quantity INT;
    DECLARE v_borrowed_count INT;
    DECLARE v_available INT;
    
    -- Cursor for all books
    DECLARE cur_books CURSOR FOR
        SELECT BookID, Quantity FROM books;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur_books;
    
    quantity_loop: LOOP
        FETCH cur_books INTO v_book_id, v_quantity;
        
        IF done THEN
            LEAVE quantity_loop;
        END IF;
        
        -- Count currently borrowed books
        SELECT COUNT(*) INTO v_borrowed_count
        FROM borrowing 
        WHERE BookID = v_book_id AND Status = 'borrowed';
        
        -- Calculate available quantity
        SET v_available = v_quantity - v_borrowed_count;
        IF v_available < 0 THEN
            SET v_available = 0;
        END IF;
        
        -- Update available quantity
        UPDATE books 
        SET AvailableQuantity = v_available 
        WHERE BookID = v_book_id;
        
    END LOOP;
    
    CLOSE cur_books;
END//

DELIMITER ;

-- =====================================================
-- 3. RUN MIGRATION
-- =====================================================

-- Check if we have backup data to migrate
SET @has_books = (SELECT COUNT(*) FROM books_backup);
SET @has_members = (SELECT COUNT(*) FROM members_backup);
SET @has_borrowing = (SELECT COUNT(*) FROM borrowing_backup);

-- Run migrations if we have data
-- Note: Remove the IF conditions if you want to force migration

-- Migrate books
CALL sp_migrate_books();

-- Migrate members  
CALL sp_migrate_members();

-- Migrate borrowing
CALL sp_migrate_borrowing();

-- Fix available quantities
CALL sp_fix_available_quantities();

-- =====================================================
-- 4. POST-MIGRATION VERIFICATION
-- =====================================================

-- Verify data counts
SELECT 
    'Migration Verification' as Title,
    (SELECT COUNT(*) FROM books_backup) as Books_Before,
    (SELECT COUNT(*) FROM books) as Books_After,
    (SELECT COUNT(*) FROM members_backup) as Members_Before,
    (SELECT COUNT(*) FROM members) as Members_After,
    (SELECT COUNT(*) FROM borrowing_backup) as Borrowing_Before,
    (SELECT COUNT(*) FROM borrowing) as Borrowing_After;

-- Check for any data issues
SELECT 'Data Issues Check' as Title;

-- Books without categories
SELECT 'Books without valid categories:' as Issue, COUNT(*) as Count
FROM books b 
LEFT JOIN categories c ON b.CategoryID = c.CategoryID 
WHERE b.CategoryID IS NOT NULL AND c.CategoryID IS NULL;

-- Members without proper codes
SELECT 'Members without member codes:' as Issue, COUNT(*) as Count
FROM members 
WHERE MemberCode IS NULL OR MemberCode = '';

-- Borrowing with invalid references
SELECT 'Borrowing with invalid book references:' as Issue, COUNT(*) as Count
FROM borrowing br
LEFT JOIN books b ON br.BookID = b.BookID
WHERE b.BookID IS NULL;

SELECT 'Borrowing with invalid member references:' as Issue, COUNT(*) as Count
FROM borrowing br
LEFT JOIN members m ON br.MemberID = m.MemberID
WHERE m.MemberID IS NULL;

-- =====================================================
-- 5. CLEANUP
-- =====================================================

-- Drop migration procedures
DROP PROCEDURE IF EXISTS sp_migrate_books;
DROP PROCEDURE IF EXISTS sp_migrate_members;
DROP PROCEDURE IF EXISTS sp_migrate_borrowing;
DROP PROCEDURE IF EXISTS sp_fix_available_quantities;

-- Keep backup tables for safety (can be dropped later if migration is successful)
-- DROP TABLE IF EXISTS books_backup;
-- DROP TABLE IF EXISTS members_backup;
-- DROP TABLE IF EXISTS borrowing_backup;

-- Commit transaction
COMMIT;

-- Reset SQL mode
SET SQL_MODE = '';

-- Final message
SELECT 'Migration completed successfully!' as Status;
SELECT 'Please verify the data and remove backup tables when satisfied.' as Note;
