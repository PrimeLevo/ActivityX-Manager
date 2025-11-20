// Simple Client-Side Router
class Router {
    constructor() {
        this.routes = {};
        this.currentPage = null;
        // Page title mapping
        this.pageTitles = {
            'dashboard': 'Ana Sayfa',
            'table': 'Aktivite Tablosu',
            'reports': 'Raporlar',
            'calisanlar': 'Çalışanlar',
            'ekipler': 'Ekipler',
            'profile': 'Profil'
        };
    }

    // Register a route
    addRoute(path, config) {
        this.routes[path] = config;
    }

    // Navigate to a page
    async navigate(path) {
        const route = this.routes[path];
        if (!route) {
            console.error(`Route not found: ${path}`);
            return;
        }

        // Update active navigation
        this.updateActiveNav(path);

        // Update page title in header
        this.updatePageTitle(path);

        // Store current page
        this.currentPage = path;

        // Load page content
        try {
            const response = await fetch(route.template);
            const html = await response.text();

            const contentArea = document.getElementById('page-content');
            contentArea.innerHTML = html;

            // Call onLoad callback if exists
            if (route.onLoad && typeof route.onLoad === 'function') {
                route.onLoad();
            }

            // Update URL without reloading
            window.history.pushState({ path }, '', `#${path}`);
        } catch (error) {
            console.error(`Error loading page: ${path}`, error);
        }
    }

    // Update page title in header
    updatePageTitle(path) {
        const pageTitleElement = document.getElementById('page-title');
        if (pageTitleElement) {
            const title = this.pageTitles[path] || path;
            pageTitleElement.textContent = title;
        }
    }

    // Update active navigation item
    updateActiveNav(path) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.route === path) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Initialize router
    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.path) {
                this.navigate(e.state.path);
            }
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.navigate(hash);
        });

        // Navigate to initial page
        const initialHash = window.location.hash.slice(1) || 'dashboard';
        this.navigate(initialHash);
    }

    // Get current page
    getCurrentPage() {
        return this.currentPage;
    }
}

// Create global router instance
const router = new Router();
