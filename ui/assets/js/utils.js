// Common utility functions used across the application

// API Helper functions
const ApiHelper = {
    // Base API URL
    baseUrl: '../apis',
    
    // Generic fetch function
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, config);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },
    
    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return await this.request(url);
    },
    
    // POST request
    async post(endpoint, data = {}) {
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT request
    async put(endpoint, data = {}) {
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE request
    async delete(endpoint) {
        return await this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// Form Helper functions
const FormHelper = {
    // Convert FormData to object
    formDataToObject(formData) {
        const obj = {};
        for (let [key, value] of formData.entries()) {
            if (value.trim() !== '') {
                obj[key] = value;
            }
        }
        return obj;
    },
    
    // Validate form fields
    validateRequired(form, fields) {
        const errors = [];
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (!input || !input.value.trim()) {
                errors.push(`Trường ${field} là bắt buộc`);
            }
        });
        return errors;
    },
    
    // Reset form
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    },
    
    // Disable/Enable submit button
    toggleSubmitButton(button, loading = false, customText = '') {
        if (loading) {
            button.disabled = true;
            const loadingText = customText || 'Đang xử lý...';
            button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${loadingText}`;
        } else {
            button.disabled = false;
            button.innerHTML = customText;
        }
    }
};

// Date Helper functions
const DateHelper = {
    // Format date to Vietnamese locale
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        const config = { ...defaultOptions, ...options };
        return new Date(date).toLocaleString('vi-VN', config);
    },
    
    // Get current year
    getCurrentYear() {
        return new Date().getFullYear();
    },
    
    // Validate year range
    isValidYear(year, minYear = 1000, maxYear = null) {
        const max = maxYear || this.getCurrentYear();
        return year >= minYear && year <= max;
    }
};

// DOM Helper functions
const DOMHelper = {
    // Get element by ID
    getElementById(id) {
        return document.getElementById(id);
    },
    
    // Get elements by class name
    getElementsByClassName(className) {
        return document.getElementsByClassName(className);
    },
    
    // Get elements by query selector
    querySelector(selector) {
        return document.querySelector(selector);
    },
    
    // Get elements by query selector all
    querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    },
    
    // Add event listener
    addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    },
    
    // Remove class
    removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    },
    
    // Add class
    addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    },
    
    // Toggle class
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },
    
    // Set text content
    setText(element, text) {
        if (element) {
            element.textContent = text;
        }
    },
    
    // Set HTML content
    setHTML(element, html) {
        if (element) {
            element.innerHTML = html;
        }
    }
};

// Number Helper functions
const NumberHelper = {
    // Format number with locale
    formatNumber(number, locale = 'vi-VN') {
        return new Intl.NumberFormat(locale).format(number);
    },
    
    // Format currency
    formatCurrency(amount, currency = 'VND', locale = 'vi-VN') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    // Parse integer safely
    parseIntSafe(value, defaultValue = 0) {
        const parsed = parseInt(value);
        return isNaN(parsed) ? defaultValue : parsed;
    },
    
    // Parse float safely
    parseFloatSafe(value, defaultValue = 0.0) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
    }
};

// String Helper functions
const StringHelper = {
    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    // Truncate string
    truncate(str, length = 50, suffix = '...') {
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },
    
    // Remove HTML tags
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    },
    
    // Escape HTML
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
};

// Debounce function for search inputs
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
