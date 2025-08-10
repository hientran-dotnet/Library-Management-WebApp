# Use PHP with Apache
FROM php:8.1-apache

# Install PHP extensions and system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mysqli gd zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite
RUN a2enmod headers

# Copy project files first
COPY . /var/www/html/

# Make startup script executable
RUN chmod +x /var/www/html/start.sh

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Configure Apache properly
RUN echo "ServerName localhost" > /etc/apache2/conf-available/servername.conf \
    && a2enconf servername

# Create Apache virtual host configuration for ui directory
RUN cat > /etc/apache2/sites-available/000-default.conf << 'EOF'
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html/ui
    ServerName localhost
    
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    <Directory /var/www/html/ui>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.php books.html index.html
    </Directory>
    
    # Handle API requests
    Alias /apis /var/www/html/apis
    <Directory /var/www/html/apis>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF

# Enable the site
RUN a2ensite 000-default

# Create a comprehensive health check endpoint
RUN cat > /var/www/html/ui/health.php << 'EOF'
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
EOF

# Create simple text health check as backup
RUN echo "OK" > /var/www/html/ui/health.txt

# Set working directory
WORKDIR /var/www/html

# Expose port 80
EXPOSE 80

# Start Apache with startup script for debugging
CMD ["/var/www/html/start.sh"]
