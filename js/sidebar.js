/**
 * Enhanced Sidebar Component
 * Professional animated sidebar with smooth transitions
 */

class EnhancedSidebar {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.toggleBtn = document.getElementById('sidebar-toggle');
        this.navItems = document.querySelectorAll('.nav-item');
        this.isCollapsed = true; // Start collapsed
        this.autoExpandEnabled = true; // Hover-to-expand enabled by default

        this.init();
    }

    init() {
        // Toggle button functionality
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }

        // Auto-expand on hover (like the React component)
        this.setupAutoExpand();

        // Add smooth scroll for nav items
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavClick(e, item);
            });
        });

        // Add keyboard navigation
        this.setupKeyboardNavigation();

        // Start in collapsed state
        this.collapse();
    }

    toggle() {
        this.isCollapsed = !this.isCollapsed;

        if (this.isCollapsed) {
            this.collapse();
        } else {
            this.expand();
        }

        // Save state to localStorage
        this.saveState();
    }

    collapse() {
        this.sidebar.classList.add('collapsed');
        this.isCollapsed = true;

        // Animate toggle button
        this.animateToggleButton();
    }

    expand() {
        this.sidebar.classList.remove('collapsed');
        this.isCollapsed = false;

        // Animate toggle button
        this.animateToggleButton();
    }

    animateToggleButton() {
        if (!this.toggleBtn) return;

        // Add a subtle pulse animation
        this.toggleBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.toggleBtn.style.transform = '';
        }, 150);
    }

    setupAutoExpand() {
        let expandTimer = null;
        let collapseTimer = null;

        this.sidebar.addEventListener('mouseenter', () => {
            clearTimeout(collapseTimer);

            if (this.isCollapsed) {
                // Expand immediately on hover
                expandTimer = setTimeout(() => {
                    this.expand();
                }, 100); // Minimal delay
            }
        });

        this.sidebar.addEventListener('mouseleave', () => {
            clearTimeout(expandTimer);

            if (!this.isCollapsed) {
                // Collapse when mouse leaves
                collapseTimer = setTimeout(() => {
                    this.collapse();
                }, 200); // Brief delay before collapsing
            }
        });
    }

    handleNavClick(e, item) {
        // Remove active class from all items
        this.navItems.forEach(navItem => {
            navItem.classList.remove('active');
        });

        // Add active class to clicked item
        item.classList.add('active');

        // Add ripple effect
        this.createRippleEffect(e, item);
    }

    createRippleEffect(e, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;

        // Add ripple animation if not exists
        if (!document.querySelector('#ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupKeyboardNavigation() {
        // Toggle sidebar with Ctrl/Cmd + B
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Navigate through items with arrow keys
        let currentIndex = Array.from(this.navItems).findIndex(item =>
            item.classList.contains('active')
        );

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return; // Don't interfere with form inputs
            }

            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();

                if (e.key === 'ArrowDown') {
                    currentIndex = (currentIndex + 1) % this.navItems.length;
                } else {
                    currentIndex = (currentIndex - 1 + this.navItems.length) % this.navItems.length;
                }

                this.navItems[currentIndex].focus();
                this.navItems[currentIndex].click();
            }
        });
    }

    saveState() {
        // Disabled: We always start collapsed and expand on hover
    }

    restoreState() {
        // Disabled: We always start collapsed and expand on hover
    }

    // Public API
    setAutoExpand(enabled) {
        this.autoExpandEnabled = enabled;
        if (enabled) {
            this.setupAutoExpand();
        }
    }
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedSidebar = new EnhancedSidebar();
    });
} else {
    window.enhancedSidebar = new EnhancedSidebar();
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedSidebar;
}
