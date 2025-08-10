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
    // Lấy BookID từ URL parameter
    $bookId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($bookId <= 0) {
        throw new Exception('BookID không hợp lệ');
    }
    
    // Lấy CategoryID từ form data hoặc JSON
    $categoryId = null;
    
    if (isset($_POST['categoryId'])) {
        $categoryId = (int)$_POST['categoryId'];
    } else {
        // Lấy từ JSON body
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['categoryId'])) {
            $categoryId = (int)$input['categoryId'];
        }
    }
    
    if (!$categoryId || $categoryId <= 0) {
        throw new Exception('CategoryID không hợp lệ');
    }
    
    // Validate CategoryID (1-6)
    if ($categoryId < 1 || $categoryId > 6) {
        throw new Exception('CategoryID phải từ 1 đến 6');
    }
    
    // Kiểm tra sách có tồn tại và chưa bị xóa không
    $checkBook = $conn->prepare("SELECT BookID, Title, CategoryID, Status FROM books WHERE BookID = ?");
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
    if ($book['Status'] !== 'active') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Không thể cập nhật sách đã bị xóa'
        ]);
        exit();
    }
    
    // Kiểm tra xem category có thay đổi không
    if ($book['CategoryID'] == $categoryId) {
        echo json_encode([
            'success' => true,
            'message' => 'Sách "' . $book['Title'] . '" đã thuộc danh mục này rồi',
            'data' => [
                'bookId' => $bookId,
                'title' => $book['Title'],
                'oldCategoryId' => $book['CategoryID'],
                'newCategoryId' => $categoryId,
                'changed' => false
            ]
        ]);
        exit();
    }
    
    // Cập nhật CategoryID
    $sql = "UPDATE books SET CategoryID = ?, UpdatedAt = CURRENT_TIMESTAMP WHERE BookID = ? AND Status = 'active'";
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([$categoryId, $bookId]);
    
    if ($result && $stmt->rowCount() > 0) {
        // Tên danh mục
        $categoryNames = [
            1 => 'Công nghệ',
            2 => 'Văn học',
            3 => 'Khoa học', 
            4 => 'Lịch sử',
            5 => 'Truyện tranh',
            6 => 'Khác'
        ];
        
        $oldCategoryName = $categoryNames[$book['CategoryID']] ?? 'Không xác định';
        $newCategoryName = $categoryNames[$categoryId] ?? 'Không xác định';
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Đã cập nhật danh mục sách "' . $book['Title'] . '" từ "' . $oldCategoryName . '" sang "' . $newCategoryName . '"',
            'data' => [
                'bookId' => $bookId,
                'title' => $book['Title'],
                'oldCategoryId' => $book['CategoryID'],
                'newCategoryId' => $categoryId,
                'oldCategoryName' => $oldCategoryName,
                'newCategoryName' => $newCategoryName,
                'changed' => true,
                'updatedAt' => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        throw new Exception('Không thể cập nhật danh mục sách');
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
