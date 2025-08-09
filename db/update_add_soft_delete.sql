-- Add IsDeleted column to books table for soft delete functionality
-- Run this script to update existing database

USE librarymanagementdb;

-- Add IsDeleted column to books table
ALTER TABLE `books` 
ADD COLUMN `IsDeleted` TINYINT(1) NOT NULL DEFAULT 0 
COMMENT '0 = Active, 1 = Soft Deleted' 
AFTER `UpdatedAt`;

-- Add index for better performance when filtering deleted books
ALTER TABLE `books` 
ADD INDEX `idx_books_isdeleted` (`IsDeleted`);

-- Add composite index for common queries
ALTER TABLE `books` 
ADD INDEX `idx_books_active` (`IsDeleted`, `CategoryID`);

-- Update existing books to be active (not deleted)
UPDATE `books` SET `IsDeleted` = 0 WHERE `IsDeleted` IS NULL;

-- Display current structure
DESCRIBE `books`;
