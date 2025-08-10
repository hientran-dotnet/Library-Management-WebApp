<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache');

// Include database config
require_once 'config/config.php';

$health = [
    'status' => 'healthy',
    'timestamp' => date('c'),
    'services' => []
];

// Check database connection using config.php settings
try {
    // Use the connection from config.php
    if (isset($conn) && $conn instanceof PDO) {
        $conn->query("SELECT 1");
        $health['services']['database'] = 'connected';
    } else {
        // Create test connection if $conn is not available
        $dsn = "mysql:host=$host;port=$port;dbname=$db_name;charset=utf8mb4";
        $test_pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_TIMEOUT => 5,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        $test_pdo->query("SELECT 1");
        $health['services']['database'] = 'connected';
    }
} catch (Exception $e) {
    $health['services']['database'] = 'disconnected';
    $health['status'] = 'degraded';
    $health['database_error'] = $e->getMessage();
}

// Check if PHP is working
$health['services']['php'] = 'working';

// Check if Apache is serving files
$health['services']['apache'] = 'working';

echo json_encode($health, JSON_PRETTY_PRINT);
?>
