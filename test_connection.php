<?php
// Test database connection for Railway
header('Content-Type: application/json');

// Include config
require_once 'includes/config.php';

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => 'production',
    'config' => [
        'host' => $host,
        'port' => $port,
        'username' => $username,
        'database' => $db_name,
        'password_set' => !empty($password) ? 'yes' : 'no'
    ],
    'connection_test' => 'failed',
    'error' => null,
    'database_exists' => false
];

try {
    // Test connection
    $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
    $test_conn = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10
    ]);
    
    $result['connection_test'] = 'success';
    
    // Check if database exists
    $stmt = $test_conn->query("SHOW DATABASES LIKE '$db_name'");
    if ($stmt->rowCount() > 0) {
        $result['database_exists'] = true;
        
        // Test connection to specific database
        $dsn_with_db = "mysql:host=$host;port=$port;dbname=$db_name;charset=utf8mb4";
        $db_conn = new PDO($dsn_with_db, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 10
        ]);
        
        // Check if tables exist
        $stmt = $db_conn->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $result['tables'] = $tables;
        $result['tables_count'] = count($tables);
        
    } else {
        $result['error'] = "Database '$db_name' does not exist";
    }
    
} catch (PDOException $e) {
    $result['error'] = $e->getMessage();
    $result['connection_test'] = 'failed';
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>
