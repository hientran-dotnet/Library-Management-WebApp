<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Chỉ cho phép POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Chỉ cho phép method POST'
    ]);
    exit();
}

// Include file kết nối database
require_once '../../includes/config.php';

try {
    // Kiểm tra file upload
    if (!isset($_FILES['csvFile']) || $_FILES['csvFile']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Không có file được upload hoặc có lỗi trong quá trình upload');
    }

    $uploadedFile = $_FILES['csvFile'];
    
    // Kiểm tra loại file
    $fileExtension = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
    if ($fileExtension !== 'csv') {
        throw new Exception('Chỉ chấp nhận file CSV');
    }
    
    // Kiểm tra kích thước file (max 5MB)
    if ($uploadedFile['size'] > 5 * 1024 * 1024) {
        throw new Exception('File quá lớn. Kích thước tối đa là 5MB');
    }
    
    // Đọc file CSV
    $csvFile = fopen($uploadedFile['tmp_name'], 'r');
    if (!$csvFile) {
        throw new Exception('Không thể đọc file CSV');
    }
    
    // Lấy các tùy chọn
    $skipFirstRow = isset($_POST['skipFirstRow']) && $_POST['skipFirstRow'] === 'true';
    $validateData = isset($_POST['validateData']) && $_POST['validateData'] === 'true';
    $skipDuplicates = isset($_POST['skipDuplicates']) && $_POST['skipDuplicates'] === 'true';
    
    $data = [];
    $lineNumber = 0;
    $errors = [];
    $duplicates = [];
    
    // Đọc từng dòng
    while (($row = fgetcsv($csvFile)) !== FALSE) {
        $lineNumber++;
        
        // Bỏ qua dòng đầu nếu được yêu cầu
        if ($skipFirstRow && $lineNumber === 1) {
            continue;
        }
        
        // Kiểm tra số cột (cần ít nhất 6 cột: Title, Author, CategoryID, ISBN, Quantity, PublishYear)
        if (count($row) < 6) {
            $errors[] = "Dòng {$lineNumber}: Không đủ cột dữ liệu (cần ít nhất 6 cột)";
            continue;
        }
        
        // Làm sạch dữ liệu
        $bookData = [
            'Title' => trim($row[0]),
            'Author' => trim($row[1]), 
            'CategoryID' => intval(trim($row[2])),
            'ISBN' => trim($row[3]),
            'Quantity' => intval(trim($row[4])),
            'PublishYear' => intval(trim($row[5])),
            'Description' => isset($row[6]) ? trim($row[6]) : '',
            'ImagePath' => isset($row[7]) ? trim($row[7]) : ''
        ];
        
        // Validation nếu được yêu cầu
        if ($validateData) {
            $rowErrors = [];
            
            if (empty($bookData['Title'])) {
                $rowErrors[] = "Tiêu đề sách không được trống";
            }
            
            if (empty($bookData['Author'])) {
                $rowErrors[] = "Tác giả không được trống";
            }
            
            if ($bookData['CategoryID'] < 1 || $bookData['CategoryID'] > 6) {
                $rowErrors[] = "CategoryID phải từ 1-6";
            }
            
            if ($bookData['Quantity'] < 0) {
                $rowErrors[] = "Số lượng không được âm";
            }
            
            if (!empty($bookData['ISBN']) && strlen($bookData['ISBN']) < 10) {
                $rowErrors[] = "ISBN không hợp lệ";
            }
            
            if ($bookData['PublishYear'] > 0 && ($bookData['PublishYear'] < 1000 || $bookData['PublishYear'] > date('Y'))) {
                $rowErrors[] = "Năm xuất bản không hợp lệ";
            }
            
            if (!empty($rowErrors)) {
                $errors[] = "Dòng {$lineNumber}: " . implode(', ', $rowErrors);
                continue;
            }
        }
        
        // Kiểm tra trùng lặp nếu được yêu cầu
        if ($skipDuplicates && !empty($bookData['ISBN'])) {
            $checkDuplicate = $conn->prepare("SELECT BookID FROM books WHERE ISBN = ? AND IsDeleted = 0");
            $checkDuplicate->execute([$bookData['ISBN']]);
            if ($checkDuplicate->fetch()) {
                $duplicates[] = "Dòng {$lineNumber}: Sách với ISBN '{$bookData['ISBN']}' đã tồn tại";
                continue;
            }
        }
        
        $data[] = $bookData;
    }
    
    fclose($csvFile);
    
    // Nếu có lỗi nghiêm trọng
    if (empty($data) && !empty($errors)) {
        throw new Exception('Không có dữ liệu hợp lệ để import. Lỗi: ' . implode('; ', array_slice($errors, 0, 5)));
    }
    
    // Thực hiện import
    $successCount = 0;
    $importErrors = [];
    
    $conn->beginTransaction();
    
    try {
        foreach ($data as $index => $bookData) {
            $sql = "INSERT INTO books (Title, Author, CategoryID, ISBN, Quantity, PublishYear, Description, ImagePath, CreatedAt, UpdatedAt, IsDeleted) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)";
            
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute([
                $bookData['Title'],
                $bookData['Author'],
                $bookData['CategoryID'],
                $bookData['ISBN'],
                $bookData['Quantity'],
                $bookData['PublishYear'] > 0 ? $bookData['PublishYear'] : null,
                $bookData['Description'],
                $bookData['ImagePath']
            ]);
            
            if ($result) {
                $successCount++;
            } else {
                $importErrors[] = "Không thể import sách: " . $bookData['Title'];
            }
        }
        
        $conn->commit();
        
        // Tạo response
        $response = [
            'success' => true,
            'message' => "Import thành công {$successCount} sách",
            'data' => [
                'totalProcessed' => count($data),
                'successCount' => $successCount,
                'errorCount' => count($importErrors),
                'duplicateCount' => count($duplicates),
                'validationErrorCount' => count($errors)
            ]
        ];
        
        // Thêm chi tiết lỗi nếu có
        if (!empty($errors) || !empty($duplicates) || !empty($importErrors)) {
            $response['details'] = [
                'validationErrors' => array_slice($errors, 0, 10), // Chỉ hiển thị 10 lỗi đầu
                'duplicates' => array_slice($duplicates, 0, 10),
                'importErrors' => array_slice($importErrors, 0, 10)
            ];
        }
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
    
} catch (PDOException $e) {
    if ($conn && $conn->inTransaction()) {
        $conn->rollback();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Lỗi database: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollback();
    }
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
