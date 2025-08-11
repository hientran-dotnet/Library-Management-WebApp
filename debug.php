<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache');

$debug = [
    'environment_variables' => [
        'DB_HOST' => $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'NOT_SET',
        'DB_PORT' => $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: 'NOT_SET',
        'DB_USER' => $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'NOT_SET',
        'DB_PASSWORD' => $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ? '***SET***' : 'NOT_SET',
        'DB_NAME' => $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'NOT_SET'
    ],
    'php_info' => [
        'version' => phpversion(),
        'extensions' => [
            'pdo' => extension_loaded('pdo'),
            'pdo_mysql' => extension_loaded('pdo_mysql'),
            'mysqli' => extension_loaded('mysqli')
        ]
    ],
    'test_connection' => null
];

// Test database connection if env vars are set
$db_host = $_ENV['DB_HOST'] ?? getenv('DB_HOST');
if ($db_host && $db_host !== 'localhost' && $db_host !== 'NOT_SET') {
    try {
        $db_name = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'railway';
        $username = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'root';
        $password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '';
        $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: '3306';
        
        $dsn = "mysql:host=$db_host;port=$port;dbname=$db_name;charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_TIMEOUT => 10,
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        
        $pdo->query("SELECT 1");
        $debug['test_connection'] = 'SUCCESS - Connected to database';
        
        // Check if tables exist
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        $debug['database_tables'] = $tables;
        
    } catch (Exception $e) {
        $debug['test_connection'] = 'ERROR - ' . $e->getMessage();
    }
} else {
    $debug['test_connection'] = 'SKIPPED - No valid DB_HOST found';
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>
