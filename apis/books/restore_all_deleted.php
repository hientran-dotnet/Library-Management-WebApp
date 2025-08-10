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

require_once '../../includes/config.php';

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
            'message' => 'Không có sách nào trong danh sách đã xóa để khôi phục'
        ]);
        exit;
    }
    
    // Get list of books that will be restored for logging
    $booksStmt = $pdo->prepare("SELECT BookID, Title, Author FROM books WHERE Status = 'deleted'");
    $booksStmt->execute();
    $restoredBooks = $booksStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Restore all deleted books (change status from 'deleted' to 'active')
    $restoreStmt = $pdo->prepare("UPDATE books SET Status = 'active', UpdatedAt = CURRENT_TIMESTAMP WHERE Status = 'deleted'");
    $result = $restoreStmt->execute();
    
    if (!$result) {
        $pdo->rollBack();
        echo json_encode([
            'success' => false, 
            'message' => 'Lỗi khi thực hiện khôi phục tất cả'
        ]);
        exit;
    }
    
    // Get actual affected rows
    $affectedRows = $restoreStmt->rowCount();
    
    // Commit transaction
    $pdo->commit();
    
    // Log the action (optional - you can expand this)
    error_log("Restored all deleted books: " . $affectedRows . " books restored at " . date('Y-m-d H:i:s'));
    
    echo json_encode([
        'success' => true,
        'message' => "Đã khôi phục thành công {$affectedRows} sách",
        'restored_count' => $affectedRows,
        'restored_books' => $restoredBooks
    ]);
    
} catch (PDOException $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Restore all deleted books error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi hệ thống: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Rollback transaction on any other error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log("Restore all deleted books general error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi không xác định: ' . $e->getMessage()
    ]);
}
?>
