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
require_once '../../config/config.php';

try {
    // Lấy parameters từ URL
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    // Validate parameters
    if ($page < 1) $page = 1;
    if ($limit < 1 || $limit > 100) $limit = 10;
    
    $offset = ($page - 1) * $limit;
    
    // Xây dựng câu truy vấn với WHERE conditions
    $whereConditions = ["Status = 'deleted'"]; // Chỉ lấy sách đã bị xóa
    $params = [];
    
    if (!empty($search)) {
        $whereConditions[] = "(Title LIKE ? OR Author LIKE ? OR ISBN LIKE ?)";
        $searchParam = "%{$search}%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }
    
    $whereClause = "WHERE " . implode(" AND ", $whereConditions);
    
    // Đếm tổng số sách đã xóa
    $countSql = "SELECT COUNT(*) as total FROM books $whereClause";
    $countStmt = $conn->prepare($countSql);
    $countStmt->execute($params);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Tính toán pagination
    $totalPages = ceil($totalCount / $limit);
    
    // Lấy dữ liệu sách đã xóa
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
                Status,
                CreatedAt,
                UpdatedAt
            FROM books 
            $whereClause
            ORDER BY UpdatedAt DESC
            LIMIT $limit OFFSET $offset";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Thống kê sách đã xóa
    $statsSql = "SELECT 
                    COUNT(*) as total_deleted_books,
                    SUM(Quantity) as total_deleted_copies,
                    COUNT(DISTINCT CategoryID) as deleted_categories
                 FROM books WHERE Status = 'deleted'";
    $statsStmt = $conn->prepare($statsSql);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Lấy danh sách sách đã xóa thành công',
        'data' => [
            'books' => $books,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_items' => (int)$totalCount,
                'limit' => $limit,
                'has_next' => $page < $totalPages,
                'has_prev' => $page > 1
            ],
            'stats' => [
                'total_deleted_books' => (int)$stats['total_deleted_books'],
                'total_deleted_copies' => (int)$stats['total_deleted_copies'],
                'deleted_categories' => (int)$stats['deleted_categories']
            ]
        ]
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
