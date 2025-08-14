<?php
// Database configuration
// Railway Public Network Connection
if (isset($_SERVER['RAILWAY_ENVIRONMENT']) || strpos($_SERVER['HTTP_HOST'] ?? '', 'railway.app') !== false) {
    // Railway Production - FROM YOUR MYSQL SERVICE
    $host = "shortline.proxy.rlwy.net"; // Railway MySQL public host
    $port = "10475";                    // Railway MySQL public port  
    $username = "root";                 // MySQL username
    $password = "BYBzBTxwZziIdHkRDrxsZDItWdcbQRgh";  // You need to get this from Railway
    $db_name = "railway";  // Use Railway's default database name
} else {
    // Local Development
    $host = "localhost";
    $db_name = "librarymanagementdb";
    $username = "root";
    $password = "";
    $port = "3306";
}

// Connection retry logic for Railway
$max_retries = 5;
$retry_delay = 2; // seconds
$conn = null;

for ($i = 0; $i < $max_retries; $i++) {
    try {
        // Create PDO connection with Railway-compatible settings
        $dsn = "mysql:host=$host;port=$port;dbname=$db_name;charset=utf8mb4";
        
        $conn = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
            PDO::ATTR_TIMEOUT => 30,
            PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true
        ]);

        // Test connection
        $conn->query("SELECT 1");
        break; // Connection successful
        
    } catch (PDOException $e) {
        error_log("Database connection attempt " . ($i + 1) . " failed: " . $e->getMessage());
        
        if ($i < $max_retries - 1) {
            sleep($retry_delay);
            continue;
        }
        
        // Final attempt failed
        error_log("All database connection attempts failed: " . $e->getMessage());
        
        if (php_sapi_name() === 'cli') {
            echo "Database connection failed after $max_retries attempts. Check your configuration.\n";
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => 'Database connection failed. Service temporarily unavailable.'
            ]);
        }
        exit();
    }
}

// Connection successful
if (!$conn) {
    error_log("Unexpected error: Connection object is null");
    exit();
}
?>
