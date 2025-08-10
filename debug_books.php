<?php
require_once '../../includes/config.php';

try {
    // Check current structure
    echo "<h3>Checking books table structure:</h3>";
    
    $stmt = $conn->prepare("DESCRIBE books");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<pre>";
    foreach ($columns as $column) {
        print_r($column);
    }
    echo "</pre>";
    
    // Check current data
    echo "<h3>Current books data:</h3>";
    $stmt = $conn->prepare("SELECT BookID, Title, Status FROM books LIMIT 10");
    $stmt->execute();
    $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<pre>";
    print_r($books);
    echo "</pre>";
    
    // Check counts by status
    echo "<h3>Books count by status:</h3>";
    $stmt = $conn->prepare("SELECT Status, COUNT(*) as count FROM books GROUP BY Status");
    $stmt->execute();
    $counts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<pre>";
    print_r($counts);
    echo "</pre>";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
