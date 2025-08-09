# Hệ Thống Quản Lý Thư Viện - Giao Diện Người Dùng

Giao diện người dùng cho hệ thống quản lý thư viện được thiết kế dựa trên mẫu Argon Dashboard với Tailwind CSS.

## 🚀 Tính Năng

### 📊 Dashboard
- Thống kê tổng quan về sách, thành viên, mượn trả
- Biểu đồ thống kê mượn sách
- Danh sách sách phổ biến
- Hoạt động gần đây
- Thao tác nhanh

### 📚 Quản Lý Sách
- Danh sách sách với phân trang
- Thêm/sửa/xóa sách
- Tìm kiếm và lọc theo danh mục
- Upload hình ảnh sách
- Import/Export Excel

### 👥 Quản Lý Thành Viên
- Danh sách thành viên với thông tin đầy đủ
- Thêm/sửa/xóa thành viên
- Phân loại thành viên (sinh viên, giảng viên, nhân viên)
- Theo dõi trạng thái thành viên
- Lịch sử mượn sách

### 📖 Mượn/Trả Sách
- Form mượn sách với tìm kiếm thành viên và sách
- Form trả sách với tính phí phạt
- Danh sách sách đang mượn
- Theo dõi quá hạn và nhắc nhở
- Gia hạn sách

### 🔐 Đăng Nhập
- Giao diện đăng nhập đẹp mắt
- Hỗ trợ nhiều loại tài khoản
- Tích hợp đăng nhập xã hội (tùy chọn)

## 🛠️ Công Nghệ Sử Dụng

- **HTML5** - Cấu trúc trang web
- **Tailwind CSS** - Framework CSS utility-first
- **JavaScript (Vanilla)** - Tương tác người dùng
- **Font Awesome** - Biểu tượng
- **Responsive Design** - Tương thích mobile

## 📁 Cấu Trúc Thư Mục

```
ui/
├── assets/
│   ├── css/
│   │   └── style.css          # CSS tùy chỉnh
│   └── js/
│       └── main.js            # JavaScript chính
├── index.html                 # Trang Dashboard
├── login.html                 # Trang đăng nhập
├── books.html                 # Quản lý sách
├── members.html               # Quản lý thành viên
├── borrowing.html             # Mượn/trả sách
└── README.md                  # Tài liệu này
```

## 🚀 Cách Sử Dụng

### 1. Cài Đặt
Chỉ cần copy thư mục `ui` vào web server (Apache, Nginx, etc.)

### 2. Truy Cập
- Mở trình duyệt và truy cập: `http://localhost/Library-Management-WebApp/ui/login.html`
- Hoặc mở trực tiếp file `login.html` trong trình duyệt

### 3. Đăng Nhập Demo
Sử dụng một trong các tài khoản demo sau:

- **Admin**: `admin` / `admin123`
- **Thủ thư**: `librarian` / `lib123`  
- **Sinh viên**: `student` / `student123`

### 4. Điều Hướng
- Sử dụng sidebar để di chuyển giữa các trang
- Trên mobile, nhấn biểu tượng menu để mở sidebar

## 🎨 Tùy Chỉnh

### Màu Sắc
Màu sắc được định nghĩa trong Tailwind config:
```javascript
colors: {
    primary: '#5e72e4',    // Xanh tím chính
    secondary: '#8392ab',  // Xám
    success: '#2dce89',    // Xanh lá
    info: '#11cdef',       // Xanh dương
    warning: '#fb6340',    // Cam
    danger: '#f5365c',     // Đỏ
    dark: '#212529'        // Đen
}
```

### Thêm Trang Mới
1. Tạo file HTML mới
2. Copy cấu trúc từ một trang hiện có
3. Cập nhật navigation trong sidebar
4. Thêm logic JavaScript nếu cần

### Tích Hợp API
Để tích hợp với backend:
1. Thay thế dữ liệu mock trong JavaScript
2. Thêm các hàm gọi API
3. Xử lý loading states và error handling

## 📱 Responsive Design

Giao diện được thiết kế responsive với các breakpoint:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Tính Năng JavaScript

### Sidebar
- Toggle responsive sidebar
- Active state cho navigation
- Auto-close trên mobile

### Form Validation
- Validation thời gian thực
- Error messages
- Success notifications

### Table Features
- Sorting (có thể mở rộng)
- Pagination
- Row selection
- Search filtering

### Notifications
- Toast notifications
- Success/error/warning/info types
- Auto-dismiss

## 🌐 Tương Thích Trình Duyệt

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

Dự án này sử dụng thiết kế từ Argon Dashboard (Creative Tim) và được phân phối dưới license MIT.

## 🤝 Đóng Góp

1. Fork dự án
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Hỗ Trợ

Nếu có vấn đề gì, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**Chúc bạn sử dụng thành công! 🎉**
