<?php
// Thông tin kết nối
$host = "localhost"; // Địa chỉ máy chủ MySQL
$db_name = "librarymanagementdb"; // Tên database
$username = "root";      // Tên user MySQL
$password = "";          // Mật khẩu MySQL

try {
    // Tạo kết nối bằng PDO
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);

    // Thiết lập chế độ báo lỗi
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Kết nối thành công - không echo để tránh ảnh hưởng JSON response
} catch (PDOException $e) {
    // Nếu lỗi
    echo "Kết nối thất bại: " . $e->getMessage();
    exit();
}
?>
