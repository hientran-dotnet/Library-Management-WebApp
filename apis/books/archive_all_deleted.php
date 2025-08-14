<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

require_once '../../config/config.php';

try {
    // Use $conn from config.php instead of $pdo
    $pdo = $conn;
    
    // Start transaction
    $pdo->beginTransaction();
    
    // First, get count of deleted books
    $countStmt = $pdo->prepare("SELECT COUNT(*) as count FROM books WHERE Status = 'deleted'");
    $countStmt->execute();
    $deletedCount = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($deletedCount == 0) {
        $pdo->rollBack();
        echo json_encode([
            'success' => false, 
            'message' => 'Không có sách nào trong danh sách đã xóa'
        ]);
        exit;
    }
    
    // Get list of books that will be archived for logging
    $booksStmt = $pdo->prepare("SELECT BookID, Title, Author FROM books WHERE Status = 'deleted'");
    $booksStmt->execute();
    $archivedBooks = $booksStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Archive all deleted books (change status from 'deleted' to 'archived')
    $archiveStmt = $pdo->prepare("UPDATE books SET Status = 'archived', UpdatedAt = CURRENT_TIMESTAMP WHERE Status = 'deleted'");
    $result = $archiveStmt->execute();
    
    if (!$result) {
        $pdo->rollBack();
        echo json_encode([
            'success' => false, 
            'message' => 'Lỗi khi thực hiện xóa vĩnh viễn'
        ]);
        exit;
    }
    
    // Get actual affected rows
    $affectedRows = $archiveStmt->rowCount();
    
    // Commit transaction
    $pdo->commit();
    
    // Log the action (optional - you can expand this)
    error_log("Archived all deleted books: " . $affectedRows . " books archived at " . date('Y-m-d H:i:s'));
    
    echo json_encode([
        'success' => true,
        'message' => "Đã xóa vĩnh viễn {$affectedRows} sách thành công",
        'archived_count' => $affectedRows,
        'archived_books' => $archivedBooks
    ]);
    
} catch (PDOException $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Archive all deleted books error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Rollback transaction on any other error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Archive all deleted books general error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi không xác định: ' . $e->getMessage()
    ]);
}
?>
