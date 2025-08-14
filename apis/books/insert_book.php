<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Chỉ cho phép method POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Chỉ cho phép method POST'
    ]);
    exit();
}

// Include file kết nối database
require_once '../../config/config.php';

try {
    // Lấy dữ liệu JSON từ request body
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Kiểm tra dữ liệu đầu vào
    if (!$input) {
        throw new Exception('Dữ liệu JSON không hợp lệ');
    }
    
    // Validate các trường bắt buộc
    $required_fields = ['Title', 'Author'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Trường {$field} là bắt buộc");
        }
    }
    
    // Chuẩn bị dữ liệu
    $title = trim($input['Title']);
    $author = trim($input['Author']);
    $isbn = isset($input['ISBN']) ? trim($input['ISBN']) : null;
    $categoryId = isset($input['CategoryID']) ? (int)$input['CategoryID'] : null;
    $publishYear = isset($input['PublishYear']) ? (int)$input['PublishYear'] : null;
    $quantity = isset($input['Quantity']) ? (int)$input['Quantity'] : 0;
    $description = isset($input['Description']) ? trim($input['Description']) : null;
    $imagePath = isset($input['ImagePath']) ? trim($input['ImagePath']) : null;
    
    // Validate năm xuất bản
    if ($publishYear && ($publishYear < 1000 || $publishYear > date('Y'))) {
        throw new Exception('Năm xuất bản không hợp lệ');
    }
    
    // Validate số lượng
    if ($quantity < 0) {
        throw new Exception('Số lượng không thể âm');
    }
    
    // Kiểm tra ISBN đã tồn tại chưa (nếu có) - chỉ kiểm tra sách active và deleted
    if ($isbn) {
        $checkIsbn = $conn->prepare("SELECT BookID FROM books WHERE ISBN = ? AND Status IN ('active', 'deleted')");
        $checkIsbn->execute([$isbn]);
        if ($checkIsbn->fetch()) {
            throw new Exception('ISBN này đã tồn tại trong hệ thống');
        }
    }
    
    // Câu lệnh SQL để thêm sách
    $sql = "INSERT INTO books (Title, Author, ISBN, CategoryID, PublishYear, Quantity, Description, ImagePath) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $result = $stmt->execute([
        $title,
        $author,
        $isbn,
        $categoryId,
        $publishYear,
        $quantity,
        $description,
        $imagePath
    ]);
    
    if ($result) {
        $bookId = $conn->lastInsertId();
        
        // Lấy thông tin sách vừa thêm
        $getBook = $conn->prepare("SELECT * FROM books WHERE BookID = ?");
        $getBook->execute([$bookId]);
        $newBook = $getBook->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Thêm sách thành công',
            'data' => $newBook
        ]);
    } else {
        throw new Exception('Lỗi khi thêm sách vào database');
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
