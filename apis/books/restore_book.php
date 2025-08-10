<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

// Cho phép POST và PUT method
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Chỉ cho phép method POST hoặc PUT'
    ]);
    exit();
}

// Include file kết nối database
require_once '../../includes/config.php';

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
    
    // Kiểm tra sách có tồn tại không
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
    
    // Kiểm tra sách có bị xóa không
    if ($book['Status'] !== 'deleted') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Chỉ có thể khôi phục sách ở trạng thái đã xóa'
        ]);
        exit();
    }
    
    // Thực hiện restore - đánh dấu Status = 'active'
    $sql = "UPDATE books SET Status = 'active', UpdatedAt = CURRENT_TIMESTAMP WHERE BookID = ?";
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([$bookId]);
    
    if ($result) {
        // Lấy thông tin sách sau khi khôi phục
        $getBook = $conn->prepare("SELECT * FROM books WHERE BookID = ? AND Status = 'active'");
        $getBook->execute([$bookId]);
        $restoredBook = $getBook->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Đã khôi phục sách "' . $book['Title'] . '" thành công',
            'data' => $restoredBook
        ]);
    } else {
        throw new Exception('Lỗi khi khôi phục sách');
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
