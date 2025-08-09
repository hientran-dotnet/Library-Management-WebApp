// Main JavaScript for Library Management System

// DOM elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    initializeTooltips();
    initializeNotifications();
    initializeCharts();
    initializeFormValidation();
});

// Sidebar functionality
function initializeSidebar() {
    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', closeSidebar);
        
        // Close sidebar when clicking on links on mobile
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) {
                    closeSidebar();
                }
            });
        });
    }
}

function toggleSidebar() {
    if (sidebar.classList.contains('-translate-x-full')) {
        openSidebar();
    } else {
        closeSidebar();
    }
}

function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// Notification system
function initializeNotifications() {
    window.showNotification = function(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = getNotificationIcon(type);
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="${icon} mr-3"></i>
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="closeNotification(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                closeNotification(notification.querySelector('button'));
            }
        }, duration);
    };
    
    window.closeNotification = function(button) {
        const notification = button.closest('.notification');
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    };
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle text-green-500',
        error: 'fas fa-exclamation-circle text-red-500',
        warning: 'fas fa-exclamation-triangle text-yellow-500',
        info: 'fas fa-info-circle text-blue-500'
    };
    return icons[type] || icons.info;
}

// Tooltip initialization
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const element = event.target;
    const title = element.getAttribute('title');
    if (!title) return;
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute z-50 px-2 py-1 text-sm bg-gray-900 text-white rounded shadow-lg pointer-events-none';
    tooltip.textContent = title;
    tooltip.id = 'tooltip';
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    
    // Remove title to prevent default tooltip
    element.setAttribute('data-original-title', title);
    element.removeAttribute('title');
}

function hideTooltip(event) {
    const element = event.target;
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.remove();
    }
    
    // Restore title
    const originalTitle = element.getAttribute('data-original-title');
    if (originalTitle) {
        element.setAttribute('title', originalTitle);
        element.removeAttribute('data-original-title');
    }
}

// Chart initialization (placeholder for Chart.js)
function initializeCharts() {
    // This would be implemented with Chart.js or similar library
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        // Initialize charts here
        console.log('Chart container found:', container);
    });
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
        
        // Real-time validation
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    if (validateForm(form)) {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang xử lý...';
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            showNotification('Thao tác thành công!', 'success');
            
            // Close modal if it exists
            const modal = form.closest('.fixed');
            if (modal) {
                modal.classList.add('hidden');
            }
            
            // Reset form
            form.reset();
        }, 2000);
    }
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const fieldName = field.getAttribute('name') || 'Trường này';
    
    // Clear previous errors
    clearFieldError(event);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${fieldName} là bắt buộc`);
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Email không hợp lệ');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(value)) {
            showFieldError(field, 'Số điện thoại không hợp lệ');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('border-red-500', 'focus:ring-red-500');
    field.classList.remove('border-gray-300', 'focus:ring-primary');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    errorDiv.setAttribute('data-error-for', field.name);
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('border-red-500', 'focus:ring-red-500');
    field.classList.add('border-gray-300', 'focus:ring-primary');
    
    // Remove error message
    const errorDiv = field.parentNode.querySelector(`[data-error-for="${field.name}"]`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="Tìm kiếm"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(handleSearch, 300));
    });
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    const table = event.target.closest('.overflow-x-auto')?.querySelector('table');
    
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// Table functionality
function initializeTables() {
    // Select all checkbox functionality
    const selectAllCheckboxes = document.querySelectorAll('thead input[type="checkbox"]');
    selectAllCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const table = this.closest('table');
            const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
            rowCheckboxes.forEach(rowCheckbox => {
                rowCheckbox.checked = this.checked;
            });
        });
    });
    
    // Row selection
    const rowCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const table = this.closest('table');
            const allRowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
            const checkedCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]:checked');
            const selectAllCheckbox = table.querySelector('thead input[type="checkbox"]');
            
            if (checkedCheckboxes.length === allRowCheckboxes.length) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else if (checkedCheckboxes.length > 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            }
        });
    });
}

// Initialize tables and search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTables();
    initializeSearch();
});

// Export functions for global use
window.LibraryManagement = {
    showNotification,
    formatDate,
    formatCurrency,
    openSidebar,
    closeSidebar
};
