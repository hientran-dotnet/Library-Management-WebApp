// Edit Modal functionality
function initializeEditModal() {
    const editBookModal = document.getElementById('editBookModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    closeEditModal.addEventListener('click', () => {
        editBookModal.classList.add('hidden');
    });

    cancelEditBtn.addEventListener('click', () => {
        editBookModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    editBookModal.addEventListener('click', (e) => {
        if (e.target === editBookModal) {
            editBookModal.classList.add('hidden');
        }
    });
}

// Form submission handler for edit
function initializeEditBookForm() {
    document.getElementById('editBookForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {};
        
        // Get BookID from hidden field
        const bookId = document.getElementById('editBookId').value;
        if (!bookId) {
            showNotification('❌ Lỗi!', 'Không tìm thấy ID sách', 'error');
            return;
        }
        
        data.BookID = parseInt(bookId);
        
        // Chuyển FormData thành object
        for (let [key, value] of formData.entries()) {
            if (key !== 'bookId' && value.trim() !== '') {
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
        
        // Validate required fields
        if (!data.Title || !data.Author) {
            showNotification('❌ Lỗi!', 'Tên sách và tác giả là bắt buộc', 'error');
            return;
        }
        
        // Disable submit button và hiển thị loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        FormHelper.toggleSubmitButton(submitBtn, true, 'Đang cập nhật...');
        
        try {
            const result = await ApiHelper.put('/books/update_book_by_id.php', data);
            
            if (result.success) {
                // Hiển thị notification thành công
                const successMessage = `
                    <strong>Thông tin sách đã được cập nhật:</strong><br>
                    • ID: ${result.data.BookID}<br>
                    • Tên: ${result.data.Title}<br>
                    • Tác giả: ${result.data.Author}<br>
                    ${result.data.ISBN ? '• ISBN: ' + result.data.ISBN + '<br>' : ''}
                    • Số lượng: ${result.data.Quantity}<br>
                    • Cập nhật lúc: ${DateHelper.formatDate(result.data.UpdatedAt)}
                `;
                
                showNotification('✅ Cập nhật thành công!', successMessage, 'success', 6000);
                
                // Close modal
                document.getElementById('editBookModal').classList.add('hidden');
                
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
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}
