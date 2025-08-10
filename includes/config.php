<?php
// Database configuration
// Use environment variables for Railway deployment, fallback to localhost for development
$host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: "localhost";
$db_name = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: "librarymanagementdb";
$username = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: "root";
$password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: "";
$port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?: "3306";

try {
    // Create PDO connection with Railway-compatible settings
    $dsn = "mysql:host=$host;port=$port;dbname=$db_name;charset=utf8mb4";
    
    $conn = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);

    // Connection successful - no echo to avoid affecting JSON responses
} catch (PDOException $e) {
    // Log error for debugging but don't expose sensitive info
    error_log("Database connection failed: " . $e->getMessage());
    
    // Return generic error message
    if (php_sapi_name() === 'cli') {
        echo "Database connection failed. Check your configuration.\n";
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Database connection failed. Please try again later.'
        ]);
    }
    exit();
}
?>
