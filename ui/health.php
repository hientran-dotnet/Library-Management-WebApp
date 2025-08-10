<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache');

$health = [
    'status' => 'healthy',
    'timestamp' => date('c'),
    'services' => []
];

// Check if we can connect to database (only if environment variables are set)
$db_host = $_ENV['DB_HOST'] ?? getenv('DB_HOST');
if ($db_host && $db_host !== 'localhost') {
    try {
        $db_name = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'railway';
        $username = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'root';
        $password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '';
        $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '3306';
        
        $dsn = "mysql:host=$db_host;port=$port;dbname=$db_name";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_TIMEOUT => 5,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        
        $pdo->query("SELECT 1");
        $health['services']['database'] = 'connected';
    } catch (Exception $e) {
        $health['services']['database'] = 'disconnected';
        $health['status'] = 'degraded';
    }
} else {
    $health['services']['database'] = 'not_configured';
}

// Check if PHP is working
$health['services']['php'] = 'working';

// Check if Apache is serving files
$health['services']['apache'] = 'working';

echo json_encode($health, JSON_PRETTY_PRINT);
?>
