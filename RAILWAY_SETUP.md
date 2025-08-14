# Railway MySQL Public Connection Setup Guide

## Bước 1: Lấy thông tin MySQL từ Railway

1. Vào MySQL service trong Railway
2. Click tab "Connect" 
3. Chọn "Public Network"
4. Copy các thông tin sau:

```
Public Host: junction.proxy.rlwy.net (hoặc hostname khác)
Public Port: 12345 (hoặc port khác)
Username: root
Password: [your-password]
Database: railway (hoặc tên database khác)
```

## Bước 2: Cập nhật file includes/config.php

Thay đổi các dòng sau trong file `includes/config.php`:

```php
$host = "YOUR_RAILWAY_MYSQL_HOST";      // Ví dụ: junction.proxy.rlwy.net
$port = "YOUR_RAILWAY_MYSQL_PORT";      // Ví dụ: 12345
$username = "YOUR_MYSQL_USERNAME";      // Thường là: root
$password = "YOUR_MYSQL_PASSWORD";      // Password từ Railway
$db_name = "YOUR_DATABASE_NAME";        // Thường là: railway
```

## Bước 3: Import Database Schema

Sử dụng MySQL client để kết nối và import:

```bash
mysql -h YOUR_HOST -P YOUR_PORT -u YOUR_USERNAME -p YOUR_DATABASE < railway_schema.sql
```

Ví dụ:
```bash
mysql -h junction.proxy.rlwy.net -P 12345 -u root -p railway < railway_schema.sql
```

## Bước 4: Test kết nối

Sau khi cập nhật và deploy, truy cập:
https://library-management-webapp-production.up.railway.app/health.php

Bạn sẽ thấy: `"database": "connected"`
