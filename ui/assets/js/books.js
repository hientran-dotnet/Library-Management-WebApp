// Notification functions
function showNotification(title, message, type = 'success', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-header">
            <div class="notification-title">${title}</div>
            <button class="notification-close" onclick="closeNotification(this)">×</button>
        </div>
        <div class="notification-body">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Show animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto hide after duration
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, duration);
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Global variables
let currentPage = 1;
let currentSearch = '';
let currentCategory = '';

// Category mapping
const categoryNames = {
    1: 'Công nghệ',
    2: 'Văn học',
    3: 'Khoa học',
    4: 'Lịch sử',
    5: 'Truyện tranh',
    6: 'Khác'
};

// Load books data
async function loadBooks(page = 1, search = '', category = '') {
    try {
        const params = {
            page: page,
            limit: 10,
            search: search,
            category: category
        };
        
        const result = await ApiHelper.get('/books/get_all_books.php', params);
        
        if (result.success) {
            updateStats(result.data.stats);
            renderBooksTable(result.data.books);
            updatePagination(result.data.pagination);
            
            // Reset checkbox states
            resetCheckboxStates();
            
            // Update current state
            currentPage = page;
            currentSearch = search;
            currentCategory = category;
        } else {
            showNotification('❌ Lỗi!', result.message, 'error');
        }
    } catch (error) {
        showNotification('❌ Lỗi kết nối!', 'Không thể tải dữ liệu sách', 'error');
        console.error('Error loading books:', error);
    }
}

// Update stats cards
function updateStats(stats) {
    DOMHelper.setText(DOMHelper.getElementById('totalBooks'), NumberHelper.formatNumber(stats.total_books));
    DOMHelper.setText(DOMHelper.getElementById('totalCopies'), NumberHelper.formatNumber(stats.total_copies));
    DOMHelper.setText(DOMHelper.getElementById('totalCategories'), stats.total_categories);
    DOMHelper.setText(DOMHelper.getElementById('avgQuantity'), stats.avg_quantity_per_book);
}

// Render books table
function renderBooksTable(books) {
    const tableBody = document.getElementById('booksTableBody');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('booksTable');
    
    loadingState.classList.add('hidden');
    
    if (books.length === 0) {
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    table.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    tableBody.innerHTML = books.map(book => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="book-checkbox rounded border-gray-300 text-primary focus:ring-primary" data-book-id="${book.BookID}">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img class="h-12 w-8 object-cover rounded" 
                         src="${book.ImagePath || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'}" 
                         alt="Book" 
                         onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'">
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${book.Title}</div>
                        <div class="text-sm text-gray-500">${book.PublishYear || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${book.Author}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-10 text-primary">
                    ${categoryNames[book.CategoryID] || 'Khác'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${book.ISBN || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${book.Quantity}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(book.Quantity)}">
                    ${getStatusText(book.Quantity)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button class="text-primary hover:text-primary hover:opacity-80" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="edit-book-btn text-warning hover:text-warning hover:opacity-80" title="Chỉnh sửa" data-book-id="${book.BookID}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-danger hover:text-danger hover:opacity-80" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get status class based on quantity
function getStatusClass(quantity) {
    if (quantity > 5) return 'bg-success bg-opacity-10 text-success';
    if (quantity > 0) return 'bg-warning bg-opacity-10 text-warning';
    return 'bg-danger bg-opacity-10 text-danger';
}

// Get status text based on quantity
function getStatusText(quantity) {
    if (quantity > 5) return 'Còn nhiều';
    if (quantity > 0) return 'Còn ít';
    return 'Hết hàng';
}

// Update pagination
function updatePagination(pagination) {
    const paginationInfo = document.getElementById('paginationInfo');
    const paginationNav = document.getElementById('paginationNav');
    const prevPageMobile = document.getElementById('prevPageMobile');
    const nextPageMobile = document.getElementById('nextPageMobile');
    
    // Update info text
    paginationInfo.innerHTML = `
        Hiển thị <span class="font-medium">${pagination.showing_from}</span> đến 
        <span class="font-medium">${pagination.showing_to}</span> của
        <span class="font-medium">${pagination.total_books}</span> kết quả
    `;
    
    // Update mobile buttons
    prevPageMobile.disabled = !pagination.has_prev_page;
    nextPageMobile.disabled = !pagination.has_next_page;
    
    // Generate pagination buttons
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${pagination.current_page - 1})" 
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${!pagination.has_prev_page ? 'opacity-50 cursor-not-allowed' : ''}"
                ${!pagination.has_prev_page ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === pagination.current_page;
        paginationHTML += `
            <button onclick="changePage(${i})" 
                    class="${isActive ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${pagination.current_page + 1})" 
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${!pagination.has_next_page ? 'opacity-50 cursor-not-allowed' : ''}"
                ${!pagination.has_next_page ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationNav.innerHTML = paginationHTML;
}

// Change page function
function changePage(page) {
    if (page < 1) return;
    loadBooks(page, currentSearch, currentCategory);
}

// Search and filter functions
function handleSearch() {
    const searchInput = document.querySelector('input[placeholder="Tìm kiếm sách..."]');
    const search = searchInput.value.trim();
    loadBooks(1, search, currentCategory);
}

function handleCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const category = categoryFilter.value;
    loadBooks(1, currentSearch, category);
}

// Load book data for editing
async function loadBookForEdit(bookId) {
    try {
        const result = await ApiHelper.get(`/books/get_book_by_id.php?id=${bookId}`);
        
        if (result.success) {
            const book = result.data;
            
            // Populate form fields
            document.getElementById('editBookId').value = book.BookID;
            document.getElementById('editTitle').value = book.Title || '';
            document.getElementById('editAuthor').value = book.Author || '';
            document.getElementById('editIsbn').value = book.ISBN || '';
            document.getElementById('editCategoryId').value = book.CategoryID || '';
            document.getElementById('editPublishYear').value = book.PublishYear || '';
            document.getElementById('editQuantity').value = book.Quantity || '';
            document.getElementById('editDescription').value = book.Description || '';
            document.getElementById('editImagePath').value = book.ImagePath || '';
            
            // Show modal
            document.getElementById('editBookModal').classList.remove('hidden');
        } else {
            showNotification('❌ Lỗi!', result.message, 'error');
        }
    } catch (error) {
        showNotification('❌ Lỗi kết nối!', 'Không thể tải thông tin sách', 'error');
        console.error('Error loading book:', error);
    }
}

// Add event listeners for edit buttons
function addEditEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-book-btn')) {
            const bookId = e.target.closest('.edit-book-btn').getAttribute('data-book-id');
            if (bookId) {
                loadBookForEdit(bookId);
            }
        }
    });
}

// Function to handle select all books
function initSelectAllBooks() {
    const selectAllCheckbox = document.getElementById('selectAllBooks');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const bookCheckboxes = document.querySelectorAll('.book-checkbox');
            bookCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateSelectedBooksUI();
        });
    }
    
    // Add event listener for individual checkboxes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('book-checkbox')) {
            updateSelectAllState();
            updateSelectedBooksUI();
        }
    });
    
    // Initialize bulk action event listeners
    initBulkActions();
}

// Initialize bulk action buttons
function initBulkActions() {
    // Bulk delete button
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', function() {
            const selectedIds = getSelectedBookIds();
            if (selectedIds.length > 0) {
                if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sách đã chọn?`)) {
                    bulkDeleteBooks(selectedIds);
                }
            }
        });
    }
    
    // Bulk export button
    const bulkExportBtn = document.getElementById('bulkExportBtn');
    if (bulkExportBtn) {
        bulkExportBtn.addEventListener('click', function() {
            const selectedIds = getSelectedBookIds();
            if (selectedIds.length > 0) {
                exportSelectedBooks(selectedIds);
            }
        });
    }
    
    // Bulk category change button
    const bulkCategoryBtn = document.getElementById('bulkCategoryBtn');
    if (bulkCategoryBtn) {
        bulkCategoryBtn.addEventListener('click', function() {
            const selectedIds = getSelectedBookIds();
            if (selectedIds.length > 0) {
                showBulkCategoryModal(selectedIds);
            }
        });
    }
}

// Update select all checkbox state based on individual checkboxes
function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAllBooks');
    const bookCheckboxes = document.querySelectorAll('.book-checkbox');
    const checkedBoxes = document.querySelectorAll('.book-checkbox:checked');
    
    if (selectAllCheckbox) {
        if (checkedBoxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedBoxes.length === bookCheckboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
}

// Update UI to show selected books count
function updateSelectedBooksUI() {
    const checkedBoxes = document.querySelectorAll('.book-checkbox:checked');
    const selectedCount = checkedBoxes.length;
    
    // Update selected count display
    const selectedCountElement = document.getElementById('selectedCount');
    if (selectedCountElement) {
        selectedCountElement.textContent = `${selectedCount} sách được chọn`;
    }
    
    // Show/hide bulk actions based on selection
    toggleBulkActions(selectedCount > 0);
}

// Toggle bulk action buttons
function toggleBulkActions(show) {
    const bulkActionsContainer = document.getElementById('bulkActionsContainer');
    if (bulkActionsContainer) {
        if (show) {
            bulkActionsContainer.classList.remove('hidden');
        } else {
            bulkActionsContainer.classList.add('hidden');
        }
    }
}

// Reset all checkbox states
function resetCheckboxStates() {
    const selectAllCheckbox = document.getElementById('selectAllBooks');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
    
    // Hide bulk actions
    toggleBulkActions(false);
    
    // Update selected count
    const selectedCountElement = document.getElementById('selectedCount');
    if (selectedCountElement) {
        selectedCountElement.textContent = '0 sách được chọn';
    }
}

// Get selected book IDs
function getSelectedBookIds() {
    const checkedBoxes = document.querySelectorAll('.book-checkbox:checked');
    return Array.from(checkedBoxes).map(checkbox => checkbox.getAttribute('data-book-id'));
}

// Bulk delete books
async function bulkDeleteBooks(bookIds) {
    try {
        showNotification('Đang xóa sách...', 'info');
        
        for (const bookId of bookIds) {
            const response = await fetch(`../apis/books/delete_book.php?id=${bookId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Không thể xóa sách ID: ${bookId}`);
            }
        }
        
        showNotification(`Đã xóa thành công ${bookIds.length} sách!`, 'success');
        loadBooks(); // Reload the books list
        
    } catch (error) {
        console.error('Error deleting books:', error);
        showNotification('Có lỗi xảy ra khi xóa sách: ' + error.message, 'error');
    }
}

// Export selected books
function exportSelectedBooks(bookIds) {
    try {
        const selectedBooks = [];
        bookIds.forEach(id => {
            const checkbox = document.querySelector(`.book-checkbox[data-book-id="${id}"]`);
            if (checkbox) {
                const row = checkbox.closest('tr');
                const bookData = extractBookDataFromRow(row);
                if (bookData) {
                    selectedBooks.push(bookData);
                }
            }
        });
        
        if (selectedBooks.length > 0) {
            downloadExcel(selectedBooks, `selected_books_${new Date().toISOString().slice(0,10)}.xlsx`);
            showNotification(`Đã xuất ${selectedBooks.length} sách ra Excel!`, 'success');
        }
        
    } catch (error) {
        console.error('Error exporting books:', error);
        showNotification('Có lỗi xảy ra khi xuất Excel: ' + error.message, 'error');
    }
}

// Extract book data from table row
function extractBookDataFromRow(row) {
    try {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 7) {
            return {
                'Tên sách': cells[1].querySelector('.text-sm.font-medium').textContent.trim(),
                'Năm xuất bản': cells[1].querySelector('.text-sm.text-gray-500').textContent.trim(),
                'Tác giả': cells[2].textContent.trim(),
                'Danh mục': cells[3].querySelector('span').textContent.trim(),
                'ISBN': cells[4].textContent.trim(),
                'Số lượng': cells[5].textContent.trim(),
                'Trạng thái': cells[6].querySelector('span').textContent.trim()
            };
        }
        return null;
    } catch (error) {
        console.error('Error extracting book data:', error);
        return null;
    }
}

// Simple Excel download function (you can use a library like SheetJS for more features)
function downloadExcel(data, filename) {
    const headers = Object.keys(data[0]);
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => `"${row[header] || ''}"`);
        csvContent += values.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.replace('.xlsx', '.csv');
    link.click();
}

// Show bulk category change modal
function showBulkCategoryModal(bookIds) {
    // For now, just show a simple prompt
    const newCategory = prompt(`Chọn danh mục mới cho ${bookIds.length} sách:\n1. Tiểu thuyết\n2. Khoa học\n3. Lịch sử\n4. Văn học\n5. Truyện tranh\n\nNhập số từ 1-5:`);
    
    if (newCategory && newCategory >= 1 && newCategory <= 5) {
        bulkUpdateCategory(bookIds, newCategory);
    }
}

// Bulk update category
async function bulkUpdateCategory(bookIds, categoryId) {
    try {
        showNotification('Đang cập nhật danh mục...', 'info');
        
        for (const bookId of bookIds) {
            const formData = new FormData();
            formData.append('categoryId', categoryId);
            
            const response = await fetch(`../apis/books/update_book_category.php?id=${bookId}`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Không thể cập nhật sách ID: ${bookId}`);
            }
        }
        
        showNotification(`Đã cập nhật danh mục cho ${bookIds.length} sách!`, 'success');
        loadBooks(); // Reload the books list
        
    } catch (error) {
        console.error('Error updating category:', error);
        showNotification('Có lỗi xảy ra khi cập nhật danh mục: ' + error.message, 'error');
    }
}
