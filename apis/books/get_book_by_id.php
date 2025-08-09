<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Chỉ cho phép method GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Chỉ cho phép method GET'
    ]);
    exit();
}

// Include file kết nối database
require_once '../../includes/config.php';

try {
    // Lấy BookID từ URL parameter
    $bookId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($bookId <= 0) {
        throw new Exception('BookID không hợp lệ');
    }
    
    // Lấy thông tin sách
    $sql = "SELECT 
                BookID,
                Title,
                Author,
                ISBN,
                CategoryID,
                PublishYear,
                Quantity,
                Description,
                ImagePath,
                IsDeleted,
                CreatedAt,
                UpdatedAt
            FROM books 
            WHERE BookID = ? AND IsDeleted = 0";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([$bookId]);
    $book = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        throw new Exception('Không tìm thấy sách với ID: ' . $bookId . ' hoặc sách đã bị xóa');
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Lấy thông tin sách thành công',
        'data' => $book
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi database: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
