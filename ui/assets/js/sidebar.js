// Sidebar toggle functionality
class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.getElementById('mainContent');
        this.toggleBtn = document.getElementById('sidebarToggle');
        this.menuToggle = document.getElementById('menuToggle');
        this.overlay = document.getElementById('overlay');
        
        // Get initial state from inline script to prevent flash
        this.isCollapsed = window.sidebarInitialState || false;
        
        this.init();
    }
    
    init() {
        // Remove preload class and enable transitions after a short delay
        setTimeout(() => {
            this.enableTransitions();
        }, 100);
        
        // Add event listeners
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMobileSidebar());
        }
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Load saved state
        this.loadSidebarState();
    }
    
    enableTransitions() {
        // Remove preload styles and enable smooth transitions
        if (window.sidebarPreloadStyle) {
            window.sidebarPreloadStyle.remove();
            delete window.sidebarPreloadStyle;
        }
        
        // Remove preload class to enable transitions
        this.sidebar.classList.remove('sidebar-preload');
    }
    
    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
        
        if (this.isCollapsed) {
            this.collapseSidebar();
        } else {
            this.expandSidebar();
        }
        
        // Save state to localStorage
        this.saveSidebarState();
    }
    
    collapseSidebar() {
        this.sidebar.classList.remove('expanded');
        this.sidebar.classList.add('collapsed');
        
        // Adjust main content margin
        if (window.innerWidth >= 1024) { // lg breakpoint
            this.mainContent.style.marginLeft = '4rem'; // 64px
        }
    }
    
    expandSidebar() {
        this.sidebar.classList.remove('collapsed');
        this.sidebar.classList.add('expanded');
        
        // Adjust main content margin
        if (window.innerWidth >= 1024) { // lg breakpoint
            this.mainContent.style.marginLeft = '16rem'; // 256px
        }
    }
    
    toggleMobileSidebar() {
        const isHidden = this.sidebar.classList.contains('-translate-x-full');
        
        if (isHidden) {
            this.openMobileSidebar();
        } else {
            this.closeMobileSidebar();
        }
    }
    
    openMobileSidebar() {
        this.sidebar.classList.remove('-translate-x-full');
        this.overlay.classList.remove('hidden');
    }
    
    closeMobileSidebar() {
        this.sidebar.classList.add('-translate-x-full');
        this.overlay.classList.add('hidden');
    }
    
    handleResize() {
        if (window.innerWidth >= 1024) { // lg breakpoint
            // Desktop: show sidebar and adjust main content
            this.sidebar.classList.remove('-translate-x-full');
            this.overlay.classList.add('hidden');
            
            if (this.isCollapsed) {
                this.mainContent.style.marginLeft = '4rem';
            } else {
                this.mainContent.style.marginLeft = '16rem';
            }
        } else {
            // Mobile: reset main content margin
            this.mainContent.style.marginLeft = '0';
        }
    }
    
    saveSidebarState() {
        localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
    }
    
    loadSidebarState() {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            this.isCollapsed = true;
            // Apply collapsed state immediately without animation
            this.sidebar.classList.remove('expanded');
            this.sidebar.classList.add('collapsed');
        } else {
            this.isCollapsed = false;
            // Apply expanded state immediately without animation
            this.sidebar.classList.remove('collapsed');
            this.sidebar.classList.add('expanded');
        }
        
        // Update main content margin for desktop
        if (window.innerWidth >= 1024) {
            if (this.isCollapsed) {
                this.mainContent.style.marginLeft = '4rem';
            } else {
                this.mainContent.style.marginLeft = '16rem';
            }
        }
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new SidebarManager();
});
