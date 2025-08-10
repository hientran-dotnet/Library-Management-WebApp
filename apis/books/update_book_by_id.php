<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Chỉ cho phép method PUT và OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Chỉ cho phép method PUT'
    ]);
    exit();
}

// Include file kết nối database
require_once '../../config/config.php';

try {
    // Lấy dữ liệu JSON từ request body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Dữ liệu JSON không hợp lệ');
    }
    
    // Kiểm tra BookID
    if (!isset($data['BookID']) || empty($data['BookID'])) {
        throw new Exception('BookID là bắt buộc');
    }
    
    $bookId = (int)$data['BookID'];
    
    // Kiểm tra sách có tồn tại không
    $checkSql = "SELECT BookID FROM books WHERE BookID = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute([$bookId]);
    
    if (!$checkStmt->fetch()) {
        throw new Exception('Không tìm thấy sách với ID: ' . $bookId);
    }
    
    // Validate các trường bắt buộc
    if (empty($data['Title'])) {
        throw new Exception('Tên sách không được để trống');
    }
    
    if (empty($data['Author'])) {
        throw new Exception('Tác giả không được để trống');
    }
    
    // Kiểm tra ISBN trùng lặp (nếu có thay đổi)
    if (!empty($data['ISBN'])) {
        $isbnCheckSql = "SELECT BookID FROM books WHERE ISBN = ? AND BookID != ?";
        $isbnCheckStmt = $conn->prepare($isbnCheckSql);
        $isbnCheckStmt->execute([$data['ISBN'], $bookId]);
        
        if ($isbnCheckStmt->fetch()) {
            throw new Exception('ISBN đã tồn tại trong hệ thống');
        }
    }
    
    // Validate CategoryID nếu có
    if (!empty($data['CategoryID'])) {
        $categoryId = (int)$data['CategoryID'];
        if ($categoryId < 1 || $categoryId > 6) {
            throw new Exception('CategoryID không hợp lệ');
        }
    }
    
    // Validate PublishYear nếu có
    if (!empty($data['PublishYear'])) {
        $publishYear = (int)$data['PublishYear'];
        $currentYear = date('Y');
        if ($publishYear < 1000 || $publishYear > $currentYear) {
            throw new Exception('Năm xuất bản không hợp lệ');
        }
    }
    
    // Validate Quantity
    if (isset($data['Quantity'])) {
        $quantity = (int)$data['Quantity'];
        if ($quantity < 0) {
            throw new Exception('Số lượng không được âm');
        }
    }
    
    // Xây dựng câu query UPDATE động
    $updateFields = [];
    $params = [];
    
    // Các trường có thể cập nhật
    $allowedFields = [
        'Title' => 'Title',
        'Author' => 'Author', 
        'ISBN' => 'ISBN',
        'CategoryID' => 'CategoryID',
        'PublishYear' => 'PublishYear',
        'Quantity' => 'Quantity',
        'Description' => 'Description',
        'ImagePath' => 'ImagePath'
    ];
    
    foreach ($allowedFields as $field => $column) {
        if (isset($data[$field])) {
            $updateFields[] = "$column = ?";
            $params[] = $data[$field];
        }
    }
    
    if (empty($updateFields)) {
        throw new Exception('Không có dữ liệu để cập nhật');
    }
    
    // Thêm UpdatedAt
    $updateFields[] = "UpdatedAt = NOW()";
    
    // Thêm BookID vào params cho WHERE clause
    $params[] = $bookId;
    
    // Thực hiện UPDATE
    $sql = "UPDATE books SET " . implode(', ', $updateFields) . " WHERE BookID = ?";
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute($params);
    
    if (!$result) {
        throw new Exception('Lỗi khi cập nhật sách');
    }
    
    // Lấy thông tin sách sau khi cập nhật
    $selectSql = "SELECT 
                    BookID,
                    Title,
                    Author,
                    ISBN,
                    CategoryID,
                    PublishYear,
                    Quantity,
                    Description,
                    ImagePath,
                    CreatedAt,
                    UpdatedAt
                  FROM books 
                  WHERE BookID = ?";
    $selectStmt = $conn->prepare($selectSql);
    $selectStmt->execute([$bookId]);
    $updatedBook = $selectStmt->fetch(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Cập nhật sách thành công',
        'data' => $updatedBook
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
