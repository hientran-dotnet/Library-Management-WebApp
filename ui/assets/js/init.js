// Initialize page functionality
function initializePage() {
    console.log('Initializing page...');
    
    // Load initial data
    loadBooks();
    
    // Initialize modal functionality
    initializeModal();
    
    // Initialize edit modal functionality
    initializeEditModal();
    
    // Initialize form handlers
    initializeBookForm();
    
    // Initialize edit form handlers
    initializeEditBookForm();
    
    // Add edit and delete event listeners
    addEditEventListeners();
    
    // Initialize select all functionality
    initSelectAllBooks();
    
    // Initialize deleted books modal
    initDeletedBooksModal();
    
    // Initialize CSV import functionality
    if (typeof initCsvImport === 'function') {
        console.log('Initializing CSV import...');
        initCsvImport();
    }
    
    // Initialize Archive functionality
    if (typeof initArchiveFunctionality === 'function') {
        console.log('Initializing Archive functionality...');
        initArchiveFunctionality();
    }
    
    // Initialize Delete All Permanently functionality
    if (typeof initDeleteAllPermanentlyFunctionality === 'function') {
        console.log('Initializing Delete All Permanently functionality...');
        initDeleteAllPermanentlyFunctionality();
    }
    
    console.log('Page initialization complete');
    
    // Manual test for Add Book button
    setTimeout(() => {
        const testBtn = document.getElementById('addBookBtn');
        if (testBtn) {
            console.log('Manual test: Add Book button found');
            testBtn.onclick = function(e) {
                console.log('Manual onclick triggered!');
                const modal = document.getElementById('addBookModal');
                if (modal) {
                    modal.classList.remove('hidden');
                }
            };
        } else {
            console.error('Manual test: Add Book button NOT found');
        }
    }, 1000);
    
    // Add search event listener
    const searchInput = document.querySelector('input[placeholder="Tìm kiếm sách..."]');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        // Add search icon click event
        const searchIcon = searchInput.nextElementSibling;
        if (searchIcon) {
            searchIcon.addEventListener('click', handleSearch);
            searchIcon.style.cursor = 'pointer';
        }
    }
    
    // Add category filter event listener
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
    }
    
    // Add mobile pagination event listeners
    document.getElementById('prevPageMobile').addEventListener('click', () => {
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    });
    
    document.getElementById('nextPageMobile').addEventListener('click', () => {
        changePage(currentPage + 1);
    });
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting initialization...');
    initializePage();
});
