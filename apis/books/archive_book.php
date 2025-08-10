<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed']);
    exit;
}

require_once '../../includes/config.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $bookId = $input['BookID'] ?? null;
    
    if (!$bookId) {
        throw new Exception('BookID is required');
    }
    
    // Kiểm tra sách tồn tại và đang ở trạng thái deleted
    $checkStmt = $conn->prepare("SELECT BookID, Title, Status FROM books WHERE BookID = ?");
    $checkStmt->execute([$bookId]);
    $book = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        throw new Exception('Sách không tồn tại');
    }
    
    if ($book['Status'] !== 'deleted') {
        throw new Exception('Chỉ có thể archive sách đã bị xóa');
    }
    
    // Archive sách (xóa vĩnh viễn)
    $archiveStmt = $conn->prepare("UPDATE books SET Status = 'archived', UpdatedAt = NOW() WHERE BookID = ?");
    $result = $archiveStmt->execute([$bookId]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Sách đã được xóa vĩnh viễn thành công',
            'data' => [
                'BookID' => $bookId,
                'Title' => $book['Title']
            ]
        ]);
    } else {
        throw new Exception('Không thể archive sách');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
