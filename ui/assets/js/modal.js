// Modal functionality
function initializeModal() {
    const addBookBtn = document.getElementById('addBookBtn');
    const addBookModal = document.getElementById('addBookModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');

    addBookBtn.addEventListener('click', () => {
        addBookModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        addBookModal.classList.add('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        addBookModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    addBookModal.addEventListener('click', (e) => {
        if (e.target === addBookModal) {
            addBookModal.classList.add('hidden');
        }
    });
}

// Form submission handler
function initializeBookForm() {
    document.getElementById('bookForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {};
        
        // Chuyển FormData thành object
        for (let [key, value] of formData.entries()) {
            if (value.trim() !== '') {
                // Chuyển đổi key thành format phù hợp với database
                switch(key) {
                    case 'title':
                        data.Title = value;
                        break;
                    case 'author':
                        data.Author = value;
                        break;
                    case 'isbn':
                        data.ISBN = value;
                        break;
                    case 'categoryId':
                        data.CategoryID = NumberHelper.parseIntSafe(value);
                        break;
                    case 'publishYear':
                        data.PublishYear = NumberHelper.parseIntSafe(value);
                        break;
                    case 'quantity':
                        data.Quantity = NumberHelper.parseIntSafe(value);
                        break;
                    case 'description':
                        data.Description = value;
                        break;
                    case 'imagePath':
                        data.ImagePath = value;
                        break;
                }
            }
        }
        
        // Disable submit button và hiển thị loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        FormHelper.toggleSubmitButton(submitBtn, true);
        
        try {
            const result = await ApiHelper.post('/books/insert_book.php', data);
            
            if (result.success) {
                // Hiển thị notification thành công
                const successMessage = `
                    <strong>Thông tin sách vừa thêm:</strong><br>
                    • ID: ${result.data.BookID}<br>
                    • Tên: ${result.data.Title}<br>
                    • Tác giả: ${result.data.Author}<br>
                    ${result.data.ISBN ? '• ISBN: ' + result.data.ISBN + '<br>' : ''}
                    • Số lượng: ${result.data.Quantity}<br>
                    • Thời gian: ${DateHelper.formatDate(result.data.CreatedAt)}
                `;
                
                showNotification('✅ Thêm sách thành công!', successMessage, 'success', 6000);
                
                // Reset form và đóng modal
                FormHelper.resetForm('bookForm');
                DOMHelper.addClass(DOMHelper.getElementById('addBookModal'), 'hidden');
                
                // Reload books data to update the table
                loadBooks(currentPage, currentSearch, currentCategory);
                
            } else {
                showNotification('❌ Lỗi!', result.message, 'error', 5000);
            }
        } catch (error) {
            const errorMessage = `
                ${error.message}<br><br>
                <strong>Gợi ý:</strong><br>
                • Kiểm tra XAMPP đã khởi động Apache và MySQL chưa<br>
                • Truy cập qua http://localhost thay vì Live Server<br>
                • Kiểm tra đường dẫn API
            `;
            showNotification('❌ Lỗi kết nối!', errorMessage, 'error', 7000);
        } finally {
            // Restore submit button
            FormHelper.toggleSubmitButton(submitBtn, false, originalText);
        }
    });
}
