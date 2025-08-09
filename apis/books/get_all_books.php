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
    // Lấy các tham số từ URL
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';
    $offset = ($page - 1) * $limit;
    
    // Validate tham số
    if ($page < 1) $page = 1;
    if ($limit < 1 || $limit > 100) $limit = 10;
    
    // Xây dựng câu truy vấn với WHERE conditions
    $whereConditions = [];
    $params = [];
    
    if (!empty($search)) {
        $whereConditions[] = "(Title LIKE ? OR Author LIKE ? OR ISBN LIKE ?)";
        $searchParam = "%{$search}%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }
    
    if (!empty($category)) {
        $whereConditions[] = "CategoryID = ?";
        $params[] = (int)$category;
    }
    
    $whereClause = '';
    if (!empty($whereConditions)) {
        $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
    }
    
    // Đếm tổng số sách (cho pagination)
    $countSql = "SELECT COUNT(*) as total FROM books $whereClause";
    $countStmt = $conn->prepare($countSql);
    $countStmt->execute($params);
    $totalBooks = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Lấy danh sách sách với pagination
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
                CreatedAt,
                UpdatedAt
            FROM books 
            $whereClause
            ORDER BY CreatedAt DESC 
            LIMIT $limit OFFSET $offset";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Tính toán thông tin pagination
    $totalPages = ceil($totalBooks / $limit);
    $hasNextPage = $page < $totalPages;
    $hasPrevPage = $page > 1;
    
    // Thống kê tổng quan
    $statsSql = "SELECT 
                    COUNT(*) as total_books,
                    SUM(Quantity) as total_copies,
                    COUNT(DISTINCT CategoryID) as total_categories,
                    AVG(Quantity) as avg_quantity_per_book
                 FROM books";
    $statsStmt = $conn->prepare($statsSql);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    // Thống kê theo danh mục
    $categorySql = "SELECT 
                        CategoryID,
                        COUNT(*) as book_count,
                        SUM(Quantity) as total_copies
                    FROM books 
                    GROUP BY CategoryID 
                    ORDER BY book_count DESC";
    $categoryStmt = $conn->prepare($categorySql);
    $categoryStmt->execute();
    $categoryStats = $categoryStmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Lấy danh sách sách thành công',
        'data' => [
            'books' => $books,
            'pagination' => [
                'current_page' => $page,
                'total_pages' => $totalPages,
                'total_books' => (int)$totalBooks,
                'books_per_page' => $limit,
                'has_next_page' => $hasNextPage,
                'has_prev_page' => $hasPrevPage,
                'showing_from' => $totalBooks > 0 ? $offset + 1 : 0,
                'showing_to' => min($offset + $limit, $totalBooks)
            ],
            'stats' => [
                'total_books' => (int)$stats['total_books'],
                'total_copies' => (int)$stats['total_copies'],
                'total_categories' => (int)$stats['total_categories'],
                'avg_quantity_per_book' => round($stats['avg_quantity_per_book'], 2)
            ],
            'category_stats' => $categoryStats
        ],
        'filters' => [
            'search' => $search,
            'category' => $category,
            'page' => $page,
            'limit' => $limit
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
