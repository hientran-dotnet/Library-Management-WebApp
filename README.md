# 📚 Library Management System

A comprehensive web application for managing library operations including book cataloging, member management, and borrowing tracking.

## 🚀 Live Demo
- **Railway Deployment**: [Your-App-URL.railway.app](https://your-app-url.railway.app)

## ✨ Features
- 📖 **Book Management**: Add, edit, delete, and archive books
- 👥 **Member Management**: Manage library members
- 📋 **Borrowing System**: Track book loans and returns
- 🗑️ **Trash System**: Soft delete with restore functionality
- 📊 **Bulk Operations**: Delete/restore all books at once
- 📤 **CSV Import**: Import books from CSV files
- 📱 **Responsive Design**: Works on all devices

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS
- **Backend**: PHP 8.1, Apache
- **Database**: MySQL 8.0
- **Deployment**: Railway, Docker

## 🚀 Quick Deploy to Railway

### Option 1: One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### Option 2: Manual Deploy
1. **Fork this repository**
2. **Create Railway account**: [railway.app](https://railway.app)
3. **Connect GitHub and deploy**:
   ```bash
   # Connect your GitHub repo to Railway
   # Railway will auto-detect Dockerfile and deploy
   ```
4. **Add MySQL service** in Railway dashboard
5. **Set environment variables**:
   ```
   DB_HOST=mysql.railway.internal
   DB_NAME=railway
   DB_USER=root
   DB_PASSWORD=[auto-generated]
   DB_PORT=3306
   ```
6. **Import database schema**:
   - Use Railway's MySQL console
   - Run `railway_schema.sql`

## 💻 Local Development

### Prerequisites
- PHP 8.1+
- MySQL 8.0+
- Apache/Nginx
- Composer (optional)

### Setup
1. **Clone repository**:
   ```bash
   git clone https://github.com/hientran-dotnet/Library-Management-WebApp.git
   cd Library-Management-WebApp
   ```

2. **Setup database**:
   ```bash
   # Import database schema
   mysql -u root -p < railway_schema.sql
   ```

3. **Configure environment**:
   ```bash
   # Update includes/config.php with your database credentials
   ```

4. **Start development server**:
   ```bash
   # Using PHP built-in server
   cd ui
   php -S localhost:8000
   
   # Or use XAMPP/WAMP
   ```

5. **Access application**:
   ```
   http://localhost:8000
   ```

## 📁 Project Structure
```
Library-Management-WebApp/
├── ui/                     # Frontend files
│   ├── books.html         # Main application
│   ├── assets/
│   │   ├── css/          # Stylesheets
│   │   └── js/           # JavaScript files
├── apis/                  # Backend API endpoints
│   └── books/            # Book-related APIs
├── includes/             # Shared PHP files
│   └── config.php        # Database configuration
├── database/             # Database migrations
├── Dockerfile            # Docker configuration
├── railway.json          # Railway deployment config
└── railway_schema.sql    # Database schema
```

## 🔧 Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_NAME=librarymanagementdb
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306
```

## 📡 API Endpoints
- `GET /apis/books/get_all_books.php` - Get all active books
- `POST /apis/books/insert_book.php` - Add new book
- `PUT /apis/books/update_book_by_id.php` - Update book
- `DELETE /apis/books/delete_book.php` - Soft delete book
- `POST /apis/books/restore_book.php` - Restore deleted book
- `POST /apis/books/archive_book.php` - Permanently delete book
- `POST /apis/books/archive_all_deleted.php` - Delete all books
- `POST /apis/books/restore_all_deleted.php` - Restore all books
- `POST /apis/books/import_csv.php` - Import from CSV

## 🚢 Deployment Options

### 1. Railway (Recommended)
- ✅ Free tier available
- ✅ MySQL included
- ✅ Git integration
- ✅ Custom domains
- ✅ Environment variables

### 2. DigitalOcean App Platform
- ✅ $5/month
- ✅ Managed database
- ✅ Git integration

### 3. Heroku
- ✅ Free tier (with ClearDB)
- ✅ Easy deployment

## 🔒 Security Features
- SQL injection protection (PDO prepared statements)
- Input validation and sanitization
- Error logging
- Environment-based configuration

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author
**HienTran** - [GitHub](https://github.com/hientran-dotnet)

## 🙏 Acknowledgments
- Tailwind CSS for styling
- Font Awesome for icons
- Railway for hosting platform