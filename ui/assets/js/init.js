// Initialize page functionality
function initializePage() {
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
    
    // Add edit event listeners
    addEditEventListeners();
    
    // Initialize select all functionality
    initSelectAllBooks();
    
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
    initializePage();
});
