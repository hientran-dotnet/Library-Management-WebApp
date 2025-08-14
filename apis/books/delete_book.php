<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Cho phép cả DELETE và POST method
if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'POST'])) {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Chỉ cho phép method DELETE hoặc POST'
    ]);
    exit();
}

// Include file kết nối database
require_once '../../config/config.php';

try {
    // Lấy BookID từ URL parameter hoặc request body
    $bookId = null;
    
    if (isset($_GET['id'])) {
        $bookId = (int)$_GET['id'];
    } else {
        // Lấy từ request body
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['bookId'])) {
            $bookId = (int)$input['bookId'];
        }
    }
    
    // Validate BookID
    if (!$bookId || $bookId <= 0) {
        throw new Exception('BookID không hợp lệ');
    }
    
    // Kiểm tra sách có tồn tại và chưa bị xóa không
    $checkBook = $conn->prepare("SELECT BookID, Title, Status FROM books WHERE BookID = ?");
    $checkBook->execute([$bookId]);
    $book = $checkBook->fetch(PDO::FETCH_ASSOC);
    
    if (!$book) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Không tìm thấy sách với ID: ' . $bookId
        ]);
        exit();
    }
    
    // Kiểm tra sách đã bị xóa chưa
    if ($book['Status'] === 'deleted' || $book['Status'] === 'archived') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Sách này đã được xóa trước đó'
        ]);
        exit();
    }
    
    // Thực hiện soft delete - đánh dấu Status = 'deleted'
    $sql = "UPDATE books SET Status = 'deleted', UpdatedAt = CURRENT_TIMESTAMP WHERE BookID = ?";
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([$bookId]);
    
    if ($result) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Đã xóa sách "' . $book['Title'] . '" thành công',
            'data' => [
                'bookId' => $bookId,
                'title' => $book['Title'],
                'deletedAt' => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        throw new Exception('Lỗi khi xóa sách');
    }
    
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
