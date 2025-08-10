// Notification functions
function showNotification(title, message, type = 'success', duration = 5000) {
    console.log(`Showing notification: ${title} - ${message} - ${type}`); // Debug log
    
    // Close any existing notifications of the same type to prevent overlap
    const existingNotifications = document.querySelectorAll(`.notification-${type}`);
    existingNotifications.forEach(notification => {
        if (notification.parentElement) {
            notification.remove();
        }
    });
    
    // Define colors for different types
    const typeColors = {
        success: { bg: '#d4edda', border: '#28a745', color: '#155724' },
        error: { bg: '#f8d7da', border: '#dc3545', color: '#721c24' },
        warning: { bg: '#fff3cd', border: '#ffc107', color: '#856404' },
        info: { bg: '#d1ecf1', border: '#17a2b8', color: '#0c5460' }
    };
    
    const colors = typeColors[type] || typeColors.success;
    
    const notification = document.createElement('div');
    notification.className = `notification-${type}`;
    notification.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        width: 350px !important;
        padding: 16px !important;
        background-color: ${colors.bg} !important;
        border-left: 4px solid ${colors.border} !important;
        color: ${colors.color} !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        z-index: 9999 !important;
        font-family: Arial, sans-serif !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateX(0) !important;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="font-weight: bold; font-size: 16px; flex: 1;">${title}</div>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; padding: 0; margin-left: 10px; opacity: 0.7;">×</button>
        </div>
        <div style="font-size: 14px; line-height: 1.4;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    console.log('Notification element added to body'); // Debug log
    
    // Auto hide after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Make closeNotification globally available
window.closeNotification = closeNotification;

// Test function for debugging notifications (có thể xóa sau khi hoàn thành)
window.testNotification = function() {
    console.log('Test notification function called');
    showNotification('🧪 Test!', 'Đây là test notification sử dụng showNotification()', 'info');
};

// CSV Import functionality
function initCsvImport() {
    console.log('Initializing CSV Import...');
    
    try {
        const importCsvBtn = document.getElementById('importCsvBtn');
        const importCsvModal = document.getElementById('importCsvModal');
        const closeImportCsvModal = document.getElementById('closeImportCsvModal');
        const cancelImportBtn = document.getElementById('cancelImportBtn');
        const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
        const csvFileInput = document.getElementById('csvFileInput');
        const startImportBtn = document.getElementById('startImportBtn');
        
        console.log('Import CSV Button:', importCsvBtn);
        console.log('Import CSV Modal:', importCsvModal);
        
        if (importCsvBtn) {
            console.log('Adding click event to Import CSV button');
            importCsvBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Import CSV button clicked!');
                openImportCsvModal();
            });
        } else {
            console.error('Import CSV button not found!');
        }
        
        if (closeImportCsvModal) {
            closeImportCsvModal.addEventListener('click', function() {
                closeImportModal();
            });
        }
        
        if (cancelImportBtn) {
            cancelImportBtn.addEventListener('click', function() {
                closeImportModal();
            });
        }
        
        if (downloadTemplateBtn) {
            downloadTemplateBtn.addEventListener('click', function() {
                downloadCsvTemplate();
            });
        }
        
        if (csvFileInput) {
            csvFileInput.addEventListener('change', function(e) {
                handleFileSelect(e);
            });
        }
        
        if (startImportBtn) {
            startImportBtn.addEventListener('click', function() {
                startCsvImport();
            });
        }
        
        // Drag and drop functionality
        const dropZone = document.querySelector('.border-dashed');
        if (dropZone) {
            dropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('border-primary', 'bg-blue-50');
            });
            
            dropZone.addEventListener('dragleave', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('border-primary', 'bg-blue-50');
            });
            
            dropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('border-primary', 'bg-blue-50');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    csvFileInput.files = files;
                    handleFileSelect({ target: { files: files } });
                }
            });
        }
        
        console.log('CSV Import initialization completed successfully');
        
    } catch (error) {
        console.error('Error initializing CSV Import:', error);
    }
}

function openImportCsvModal() {
    console.log('Opening Import CSV Modal...');
    const modal = document.getElementById('importCsvModal');
    console.log('Modal element:', modal);
    if (modal) {
        modal.classList.remove('hidden');
        resetImportModal();
        console.log('Modal opened successfully');
    } else {
        console.error('Import CSV Modal not found!');
    }
}

function closeImportModal() {
    const modal = document.getElementById('importCsvModal');
    if (modal) {
        modal.classList.add('hidden');
        resetImportModal();
    }
}

function resetImportModal() {
    // Reset file input
    const csvFileInput = document.getElementById('csvFileInput');
    if (csvFileInput) {
        csvFileInput.value = '';
    }
    
    // Hide sections
    const sections = ['selectedFileName', 'csvPreview', 'importOptions', 'importStatus'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('hidden');
        }
    });
    
    // Reset button
    const startImportBtn = document.getElementById('startImportBtn');
    if (startImportBtn) {
        startImportBtn.disabled = true;
        startImportBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Bắt đầu Import';
    }
    
    // Reset progress
    const progressBar = document.getElementById('importProgressBar');
    const progressText = document.getElementById('importProgress');
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = '0%';
}

function downloadCsvTemplate() {
    window.open('../apis/books/download_template.php', '_blank');
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showNotification('❌ Lỗi file!', 'Chỉ chấp nhận file CSV', 'error');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('❌ File quá lớn!', 'Kích thước file không được vượt quá 5MB', 'error');
        return;
    }
    
    // Show selected file name
    const selectedFileName = document.getElementById('selectedFileName');
    if (selectedFileName) {
        selectedFileName.textContent = `Đã chọn: ${file.name} (${formatFileSize(file.size)})`;
        selectedFileName.classList.remove('hidden');
    }
    
    // Read and preview file
    previewCsvFile(file);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function previewCsvFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        
        if (lines.length < 2) {
            showNotification('❌ File CSV trống!', 'File CSV phải có ít nhất 2 dòng dữ liệu', 'error');
            return;
        }
        
        // Parse first 6 lines for preview
        const previewLines = lines.slice(0, 6).filter(line => line.trim());
        const data = previewLines.map(line => parseCSVLine(line));
        
        if (data.length === 0) {
            showNotification('❌ Lỗi đọc file!', 'Không thể đọc dữ liệu từ file CSV', 'error');
            return;
        }
        
        displayCsvPreview(data);
        
        // Show import options
        const importOptions = document.getElementById('importOptions');
        if (importOptions) {
            importOptions.classList.remove('hidden');
        }
        
        // Enable import button
        const startImportBtn = document.getElementById('startImportBtn');
        if (startImportBtn) {
            startImportBtn.disabled = false;
        }
    };
    
    reader.readAsText(file, 'UTF-8');
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

function displayCsvPreview(data) {
    const previewSection = document.getElementById('csvPreview');
    const previewTable = document.getElementById('previewTable');
    
    if (!previewSection || !previewTable) return;
    
    // Clear existing content
    previewTable.innerHTML = '';
    
    // Create header
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    const headerRow = document.createElement('tr');
    
    const expectedHeaders = ['Title', 'Author', 'CategoryID', 'ISBN', 'Quantity', 'PublishYear', 'Description', 'ImagePath'];
    expectedHeaders.forEach(header => {
        const th = document.createElement('th');
        th.className = 'px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    previewTable.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';
    
    // Skip first row if it looks like header
    const startIndex = isHeaderRow(data[0]) ? 1 : 0;
    const previewData = data.slice(startIndex, startIndex + 5);
    
    previewData.forEach(row => {
        const tr = document.createElement('tr');
        
        for (let i = 0; i < 8; i++) {
            const td = document.createElement('td');
            td.className = 'px-3 py-2 whitespace-nowrap text-sm text-gray-900';
            td.textContent = row[i] || '';
            tr.appendChild(td);
        }
        
        tbody.appendChild(tr);
    });
    
    previewTable.appendChild(tbody);
    previewSection.classList.remove('hidden');
}

function isHeaderRow(row) {
    if (!row || row.length === 0) return false;
    
    const headerKeywords = ['title', 'author', 'category', 'isbn', 'quantity', 'year'];
    const firstCell = row[0].toLowerCase();
    
    return headerKeywords.some(keyword => firstCell.includes(keyword));
}

async function startCsvImport() {
    const csvFileInput = document.getElementById('csvFileInput');
    const file = csvFileInput.files[0];
    
    if (!file) {
        showNotification('❌ Lỗi!', 'Vui lòng chọn file CSV', 'error');
        return;
    }
    
    // Get options
    const skipFirstRow = document.getElementById('skipFirstRow').checked;
    const validateData = document.getElementById('validateData').checked;
    const skipDuplicates = document.getElementById('skipDuplicates').checked;
    
    // Show import status
    const importStatus = document.getElementById('importStatus');
    if (importStatus) {
        importStatus.classList.remove('hidden');
    }
    
    // Disable import button
    const startImportBtn = document.getElementById('startImportBtn');
    if (startImportBtn) {
        startImportBtn.disabled = true;
        startImportBtn.innerHTML = '<div class="loading-spinner"></div> Đang import...';
    }
    
    try {
        // Update progress
        updateImportProgress(10, 'Chuẩn bị upload file...');
        
        // Create form data
        const formData = new FormData();
        formData.append('csvFile', file);
        formData.append('skipFirstRow', skipFirstRow);
        formData.append('validateData', validateData);
        formData.append('skipDuplicates', skipDuplicates);
        
        updateImportProgress(30, 'Đang upload file...');
        
        // Upload and import
        const response = await fetch('../apis/books/import_csv.php', {
            method: 'POST',
            body: formData
        });
        
        updateImportProgress(70, 'Đang xử lý dữ liệu...');
        
        const result = await response.json();
        
        updateImportProgress(100, 'Hoàn thành!');
        
        if (result.success) {
            showImportResults(result);
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Import error:', error);
        showNotification('❌ Lỗi import!', 'Có lỗi xảy ra: ' + error.message, 'error');
        
        // Reset button
        if (startImportBtn) {
            startImportBtn.disabled = false;
            startImportBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Bắt đầu Import';
        }
    }
}

function updateImportProgress(percent, message) {
    const progressBar = document.getElementById('importProgressBar');
    const progressText = document.getElementById('importProgress');
    const importDetails = document.getElementById('importDetails');
    
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
    
    if (progressText) {
        progressText.textContent = percent + '%';
    }
    
    if (importDetails) {
        importDetails.textContent = message;
    }
}

function showImportResults(result) {
    const { data, details } = result;
    
    // Close modal after a short delay
    setTimeout(() => {
        closeImportModal();
        
        // Reload books list
        loadBooks();
        
        // Show success notification
        showNotification(
            '✅ Import thành công!', 
            `Đã import ${data.successCount}/${data.totalProcessed} sách. ${data.errorCount > 0 ? `${data.errorCount} lỗi, ` : ''}${data.duplicateCount > 0 ? `${data.duplicateCount} trùng lặp` : ''}`,
            data.errorCount > 0 ? 'warning' : 'success'
        );
        
        // Show detailed results if there are issues
        if (details && (details.validationErrors?.length > 0 || details.duplicates?.length > 0 || details.importErrors?.length > 0)) {
            console.log('Import details:', details);
        }
        
    }, 2000);
}

// Archive Book Functions
let currentArchiveBookId = null;

function initArchiveFunctionality() {
    // Event delegation for archive buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.archive-book-btn')) {
            const btn = e.target.closest('.archive-book-btn');
            const bookId = btn.getAttribute('data-book-id');
            const bookTitle = btn.getAttribute('data-book-title');
            showArchiveConfirmModal(bookId, bookTitle);
        }
    });
    
    // Archive modal buttons
    const cancelArchiveBtn = document.getElementById('cancelArchiveBtn');
    const confirmArchiveBtn = document.getElementById('confirmArchiveBtn');
    
    if (cancelArchiveBtn) {
        cancelArchiveBtn.addEventListener('click', closeArchiveModal);
    }
    
    if (confirmArchiveBtn) {
        confirmArchiveBtn.addEventListener('click', confirmArchiveBook);
    }
    
    // Close modal when clicking outside
    const archiveModal = document.getElementById('archiveConfirmModal');
    if (archiveModal) {
        archiveModal.addEventListener('click', function(e) {
            if (e.target === archiveModal) {
                closeArchiveModal();
            }
        });
    }
}

function showArchiveConfirmModal(bookId, bookTitle) {
    currentArchiveBookId = bookId;
    
    const modal = document.getElementById('archiveConfirmModal');
    const titleElement = document.getElementById('archiveBookTitle');
    
    if (titleElement) {
        titleElement.textContent = bookTitle;
    }
    
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('modal-fade-in');
    }
}

function closeArchiveModal() {
    const modal = document.getElementById('archiveConfirmModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('modal-fade-in');
    }
    currentArchiveBookId = null;
}

async function confirmArchiveBook() {
    if (!currentArchiveBookId) {
        showNotification('❌ Lỗi!', 'Không có sách nào được chọn để archive', 'error');
        return;
    }
    
    const confirmBtn = document.getElementById('confirmArchiveBtn');
    const originalText = confirmBtn.innerHTML;
    
    try {
        // Disable button and show loading
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<div class="loading-spinner"></div> Đang xử lý...';
        
        const response = await fetch('../apis/books/archive_book.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                BookID: parseInt(currentArchiveBookId)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeArchiveModal();
            showNotification('🗑️ Đã xóa vĩnh viễn!', `Sách "${result.data.Title}" đã được xóa vĩnh viễn`, 'success');
            
            // Reload deleted books list
            await loadDeletedBooks();
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Archive error:', error);
        showNotification('❌ Lỗi archive!', `Không thể xóa vĩnh viễn: ${error.message}`, 'error');
        
        // Reset button
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalText;
    }
}

// Global variables
let currentPage = 1;
let currentSearch = '';
let currentCategory = '';

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

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
                    <button class="delete-book-btn text-danger hover:text-danger hover:opacity-80" title="Xóa" data-book-id="${book.BookID}" data-book-title="${escapeHtml(book.Title)}" data-book-author="${escapeHtml(book.Author)}">
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
        
        if (e.target.closest('.delete-book-btn')) {
            const btn = e.target.closest('.delete-book-btn');
            const bookId = btn.getAttribute('data-book-id');
            const bookTitle = btn.getAttribute('data-book-title');
            const bookAuthor = btn.getAttribute('data-book-author');
            if (bookId) {
                deleteBook(bookId, bookTitle, bookAuthor);
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
        showNotification('🗑️ Đang xóa...', 'Đang xóa các sách đã chọn...', 'info');
        
        for (const bookId of bookIds) {
            const response = await fetch(`../apis/books/delete_book.php?id=${bookId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Không thể xóa sách ID: ${bookId}`);
            }
        }
        
        showNotification('✅ Xóa thành công!', `Đã xóa thành công ${bookIds.length} sách!`, 'success');
        loadBooks(); // Reload the books list
        
    } catch (error) {
        console.error('Error deleting books:', error);
        showNotification('❌ Lỗi xóa sách!', 'Có lỗi xảy ra khi xóa sách: ' + error.message, 'error');
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
            showNotification('📊 Xuất Excel thành công!', `Đã xuất ${selectedBooks.length} sách ra Excel!`, 'success');
        }
        
    } catch (error) {
        console.error('Error exporting books:', error);
        showNotification('❌ Lỗi xuất Excel!', 'Có lỗi xảy ra khi xuất Excel: ' + error.message, 'error');
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

// Show bulk category change modal - REMOVED OLD VERSION
// This function is now implemented in the new modal system below

// Bulk update category
async function bulkUpdateCategory(bookIds, categoryId) {
    try {
        const startTime = Date.now();
        let loadingNotificationShown = false;
        
        // Show loading notification after 1 second delay for slow operations
        const loadingTimeout = setTimeout(() => {
            showNotification('🔄 Đang cập nhật...', 'Đang cập nhật danh mục cho các sách đã chọn...', 'info');
            loadingNotificationShown = true;
        }, 1000);
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Process books one by one with better error handling
        for (const bookId of bookIds) {
            try {
                const formData = new FormData();
                formData.append('categoryId', categoryId);
                
                const response = await fetch(`../apis/books/update_book_category.php?id=${bookId}`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                    errors.push(`Sách ID ${bookId}: ${result.message}`);
                }
                
            } catch (error) {
                errorCount++;
                errors.push(`Sách ID ${bookId}: ${error.message}`);
                console.error(`Error updating book ${bookId}:`, error);
            }
        }
        
        // Clear loading timeout
        clearTimeout(loadingTimeout);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // If operation was fast (< 1s), only show success notification
        // If operation was slow and loading notification was shown, wait a bit before showing success
        if (loadingNotificationShown && duration < 2000) {
            // Wait for user to read the loading message before showing success
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        // Show results
        if (successCount > 0) {
            const categoryNames = {
                1: 'Công nghệ',
                2: 'Văn học', 
                3: 'Khoa học',
                4: 'Lịch sử',
                5: 'Truyện tranh',
                6: 'Khác'
            };
            
            const categoryName = categoryNames[categoryId] || 'Không xác định';
            
            if (errorCount === 0) {
                showNotification('✅ Thành công!', `Đã cập nhật danh mục "${categoryName}" cho ${successCount} sách!`, 'success');
            } else {
                showNotification('⚠️ Hoàn thành một phần', `Đã cập nhật ${successCount} sách thành công, ${errorCount} sách lỗi.`, 'warning');
            }
        } else {
            throw new Error('Không thể cập nhật bất kỳ sách nào: ' + errors.join(', '));
        }
        
        loadBooks(); // Reload the books list
        
    } catch (error) {
        console.error('Error updating category:', error);
        throw error; // Re-throw to be handled by modal
    }
}

// Delete single book (soft delete) - Updated to use modern modal
function deleteBook(bookId, bookTitle, bookAuthor) {
    // Use the new confirmation modal instead of alert
    showConfirmationModal(bookId, bookTitle, bookAuthor || 'Không rõ tác giả');
}

// Deleted Books Modal Management
let deletedBooksCurrentPage = 1;
let deletedBooksCurrentSearch = '';

// Initialize deleted books modal
function initDeletedBooksModal() {
    const viewDeletedBooksBtn = document.getElementById('viewDeletedBooksBtn');
    const deletedBooksModal = document.getElementById('deletedBooksModal');
    const closeDeletedBooksModal = document.getElementById('closeDeletedBooksModal');
    const deletedBooksSearch = document.getElementById('deletedBooksSearch');
    const deletedBooksPrevBtn = document.getElementById('deletedBooksPrevBtn');
    const deletedBooksNextBtn = document.getElementById('deletedBooksNextBtn');
    
    if (viewDeletedBooksBtn) {
        viewDeletedBooksBtn.addEventListener('click', function() {
            openDeletedBooksModal();
        });
    }
    
    if (closeDeletedBooksModal) {
        closeDeletedBooksModal.addEventListener('click', function() {
            deletedBooksModal.classList.add('hidden');
        });
    }
    
    // Close modal when clicking outside
    if (deletedBooksModal) {
        deletedBooksModal.addEventListener('click', function(e) {
            if (e.target === deletedBooksModal) {
                deletedBooksModal.classList.add('hidden');
            }
        });
    }
    
    // Search functionality
    if (deletedBooksSearch) {
        deletedBooksSearch.addEventListener('input', function() {
            deletedBooksCurrentSearch = this.value;
            deletedBooksCurrentPage = 1;
            // Use setTimeout instead of debounce for now
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(() => {
                loadDeletedBooks();
            }, 300);
        });
    }
    
    // Pagination
    if (deletedBooksPrevBtn) {
        deletedBooksPrevBtn.addEventListener('click', function() {
            if (deletedBooksCurrentPage > 1) {
                deletedBooksCurrentPage--;
                loadDeletedBooks();
            }
        });
    }
    
    if (deletedBooksNextBtn) {
        deletedBooksNextBtn.addEventListener('click', function() {
            deletedBooksCurrentPage++;
            loadDeletedBooks();
        });
    }
    
    // Event delegation for restore buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.restore-book-btn')) {
            const bookId = e.target.closest('.restore-book-btn').getAttribute('data-book-id');
            const bookTitle = e.target.closest('.restore-book-btn').getAttribute('data-book-title');
            if (bookId) {
                restoreBook(bookId, bookTitle);
            }
        }
    });
}

// Open deleted books modal
function openDeletedBooksModal() {
    const deletedBooksModal = document.getElementById('deletedBooksModal');
    if (deletedBooksModal) {
        deletedBooksModal.classList.remove('hidden');
        deletedBooksCurrentPage = 1;
        deletedBooksCurrentSearch = '';
        const searchInput = document.getElementById('deletedBooksSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        loadDeletedBooks();
    }
}

// Load deleted books
async function loadDeletedBooks() {
    try {
        const params = {
            page: deletedBooksCurrentPage,
            limit: 10,
            search: deletedBooksCurrentSearch
        };
        
        const result = await ApiHelper.get('/books/get_deleted_books.php', params);
        
        if (result.success) {
            renderDeletedBooksTable(result.data.books);
            updateDeletedBooksPagination(result.data.pagination);
            updateDeletedBooksStats(result.data.stats);
        } else {
            showNotification('❌ Lỗi!', result.message, 'error');
        }
    } catch (error) {
        showNotification('❌ Lỗi kết nối!', 'Không thể tải dữ liệu sách đã xóa', 'error');
        console.error('Error loading deleted books:', error);
    }
}

// Render deleted books table
function renderDeletedBooksTable(books) {
    const tableBody = document.getElementById('deletedBooksTableBody');
    
    if (!books || books.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-smile text-3xl mb-2"></i>
                    <p>Không có sách nào bị xóa</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = books.map(book => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img class="h-12 w-8 object-cover rounded opacity-60" 
                         src="${book.ImagePath || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'}" 
                         alt="Book" 
                         onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'">
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-600">${book.Title}</div>
                        <div class="text-sm text-gray-400">${book.PublishYear || 'N/A'}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${book.Author}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                    ${categoryNames[book.CategoryID] || 'Khác'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${book.Quantity}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${formatDateTime(book.UpdatedAt)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button class="restore-book-btn text-green-600 hover:text-green-800 flex items-center px-3 py-1 rounded transition-colors duration-200" 
                            title="Khôi phục" data-book-id="${book.BookID}" data-book-title="${book.Title}">
                        <i class="fas fa-undo mr-1"></i>
                        Khôi phục
                    </button>
                    <button class="archive-book-btn text-red-600 hover:text-red-800 flex items-center px-3 py-1 rounded transition-colors duration-200" 
                            title="Xóa vĩnh viễn" data-book-id="${book.BookID}" data-book-title="${book.Title}">
                        <i class="fas fa-skull-crossbones mr-1"></i>
                        Xóa vĩnh viễn
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update deleted books pagination
function updateDeletedBooksPagination(pagination) {
    const prevBtn = document.getElementById('deletedBooksPrevBtn');
    const nextBtn = document.getElementById('deletedBooksNextBtn');
    const fromSpan = document.getElementById('deletedBooksFrom');
    const toSpan = document.getElementById('deletedBooksTo');
    const totalSpan = document.getElementById('deletedBooksTotal');
    
    if (prevBtn) prevBtn.disabled = !pagination.has_prev;
    if (nextBtn) nextBtn.disabled = !pagination.has_next;
    
    const from = (pagination.current_page - 1) * pagination.limit + 1;
    const to = Math.min(pagination.current_page * pagination.limit, pagination.total_items);
    
    if (fromSpan) fromSpan.textContent = pagination.total_items > 0 ? from : 0;
    if (toSpan) toSpan.textContent = to;
    if (totalSpan) totalSpan.textContent = pagination.total_items;
}

// Update deleted books stats
function updateDeletedBooksStats(stats) {
    const countSpan = document.getElementById('deletedBooksCount');
    if (countSpan) {
        countSpan.textContent = `${stats.total_deleted_books} sách đã xóa`;
    }
}

// Restore book
async function restoreBook(bookId, bookTitle) {
    try {
        // Confirm restoration
        const confirmed = confirm(`Bạn có chắc chắn muốn khôi phục sách "${bookTitle}"?`);
        if (!confirmed) {
            return;
        }
        
        showNotification('🔄 Đang khôi phục...', 'Đang khôi phục sách đã chọn...', 'info');
        
        const response = await fetch(`../apis/books/restore_book.php?id=${bookId}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('✅ Khôi phục thành công!', result.message, 'success');
            loadDeletedBooks(); // Reload deleted books list
            loadBooks(); // Reload main books list
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Error restoring book:', error);
        showNotification('❌ Lỗi khôi phục!', 'Có lỗi xảy ra khi khôi phục sách: ' + error.message, 'error');
    }
}

// Format datetime helper
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Confirmation Modal Management
let currentBookToDelete = null;

function showConfirmationModal(bookId, bookTitle, bookAuthor) {
    currentBookToDelete = bookId;
    
    // Update modal content
    document.getElementById('confirmBookTitle').textContent = bookTitle;
    document.getElementById('confirmBookAuthor').textContent = `Tác giả: ${bookAuthor}`;
    
    // Show modal with animation
    const modal = document.getElementById('confirmationModal');
    modal.classList.add('show');
    
    // Add event listener for confirm button
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = function() {
        confirmDeleteBook();
    };
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('show');
    
    // Reset state
    currentBookToDelete = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscapeKey);
    
    // Reset button state
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Xóa sách';
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeConfirmationModal();
    }
}

async function confirmDeleteBook() {
    if (!currentBookToDelete) return;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const startTime = Date.now();
    let loadingNotificationShown = false;
    
    // Set loading state
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<div class="loading-spinner"></div> Đang xóa...';
    
    // Show loading notification after 1.5s delay
    const loadingTimeout = setTimeout(() => {
        showNotification('🔄 Đang xóa sách...', 'Đang thực hiện xóa sách, vui lòng đợi...', 'info');
        loadingNotificationShown = true;
    }, 1500);
    
    try {
        const response = await fetch(`../apis/books/delete_book.php?id=${currentBookToDelete}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        // Clear loading timeout
        clearTimeout(loadingTimeout);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // If loading notification was shown, wait a bit before showing result
        if (loadingNotificationShown) {
            const minDisplayTime = 2000;
            const waitTime = Math.max(0, minDisplayTime - duration);
            
            if (waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        if (result.success) {
            // Close modal
            closeConfirmationModal();
            
            // Show success notification
            showNotification('✅ Thành công!', 'Sách đã được xóa thành công. Bạn có thể khôi phục từ "Sách Đã Xóa".', 'success');
            
            // Reload books table
            loadBooks();
            
        } else {
            throw new Error(result.message || 'Có lỗi xảy ra khi xóa sách');
        }
        
    } catch (error) {
        console.error('Error deleting book:', error);
        
        // Clear loading timeout
        clearTimeout(loadingTimeout);
        
        // Reset button state
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Xóa sách';
        
        // Show error notification
        showNotification('❌ Lỗi!', `Không thể xóa sách: ${error.message}`, 'error');
    }
}

// Add click outside to close modal
document.addEventListener('click', function(e) {
    const modal = document.getElementById('confirmationModal');
    if (e.target === modal) {
        closeConfirmationModal();
    }
    
    const bulkModal = document.getElementById('bulkCategoryModal');
    if (e.target === bulkModal) {
        closeBulkCategoryModal();
    }
});

// Bulk Category Change Modal Management
let selectedBooksForCategory = [];

function showBulkCategoryModal(bookIds) {
    selectedBooksForCategory = bookIds;
    
    // Update modal content
    const countElement = document.getElementById('selectedBooksCount');
    countElement.textContent = `${bookIds.length} sách được chọn`;
    
    // Reset category selection
    document.getElementById('newCategorySelect').value = '';
    
    // Show modal with animation
    const modal = document.getElementById('bulkCategoryModal');
    modal.classList.add('show');
    
    // Add event listener for confirm button
    const confirmBtn = document.getElementById('confirmCategoryChangeBtn');
    confirmBtn.onclick = function() {
        confirmCategoryChange();
    };
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Add escape key listener
    document.addEventListener('keydown', handleBulkCategoryEscapeKey);
}

function closeBulkCategoryModal() {
    const modal = document.getElementById('bulkCategoryModal');
    modal.classList.remove('show');
    
    // Reset state
    selectedBooksForCategory = [];
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleBulkCategoryEscapeKey);
    
    // Reset button state
    const confirmBtn = document.getElementById('confirmCategoryChangeBtn');
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = '<i class="fas fa-save"></i> Cập nhật danh mục';
}

function handleBulkCategoryEscapeKey(e) {
    if (e.key === 'Escape') {
        closeBulkCategoryModal();
    }
}

async function confirmCategoryChange() {
    const newCategoryId = document.getElementById('newCategorySelect').value;
    
    if (!newCategoryId) {
        showNotification('❌ Lỗi!', 'Vui lòng chọn danh mục mới', 'error');
        return;
    }
    
    if (selectedBooksForCategory.length === 0) {
        showNotification('❌ Lỗi!', 'Không có sách nào được chọn', 'error');
        return;
    }
    
    const confirmBtn = document.getElementById('confirmCategoryChangeBtn');
    
    // Set loading state
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<div class="loading-spinner"></div> Đang cập nhật...';
    
    try {
        // Call the existing bulk update function
        await bulkUpdateCategory(selectedBooksForCategory, newCategoryId);
        
        // Close modal
        closeBulkCategoryModal();
        
        // Reset checkboxes
        resetCheckboxStates();
        
    } catch (error) {
        console.error('Error updating category:', error);
        
        // Reset button state
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-save"></i> Cập nhật danh mục';
        
        // Show error notification
        showNotification('❌ Lỗi!', `Không thể cập nhật danh mục: ${error.message}`, 'error');
    }
}

// Add a global fallback function
window.openImportCsvModal = function() {
    console.log('Global openImportCsvModal called');
    const modal = document.getElementById('importCsvModal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('Modal opened via global function');
    } else {
        console.error('Modal not found in global function');
    }
};

// Remove the duplicate DOMContentLoaded - init.js will handle initialization
// We'll add initCsvImport to the existing initialization in init.js
