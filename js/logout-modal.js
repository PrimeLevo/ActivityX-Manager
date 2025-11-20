/**
 * Logout Modal Handler
 * Handles all logout modal functionality with proper event delegation
 */

class LogoutModalHandler {
    constructor() {
        this.modal = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }

        // Also setup when modal might be dynamically added
        this.observeModalPresence();
    }

    setup() {
        console.log('[LogoutModal] Setting up logout modal handler');

        // Use event delegation on document level to catch all clicks
        document.addEventListener('click', (e) => {
            // Handle sidebar logout button
            if (e.target.closest('#sidebar-logout-btn')) {
                console.log('[LogoutModal] Sidebar logout button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.showModal();
                return;
            }

            // Handle main logout button
            if (e.target.closest('#logout-btn')) {
                console.log('[LogoutModal] Main logout button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.showModal();
                return;
            }

            // Handle cancel button
            if (e.target.closest('#logout-cancel')) {
                console.log('[LogoutModal] Cancel button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.hideModal();
                return;
            }

            // Handle confirm button
            if (e.target.closest('#logout-confirm')) {
                console.log('[LogoutModal] Confirm button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.handleLogout();
                return;
            }

            // Handle backdrop click
            if (e.target.id === 'logout-modal') {
                console.log('[LogoutModal] Backdrop clicked');
                this.hideModal();
                return;
            }
        }, true); // Use capture phase to ensure we get events first

        this.isInitialized = true;
    }

    observeModalPresence() {
        // Watch for modal being added to DOM
        const observer = new MutationObserver(() => {
            if (!this.modal) {
                this.modal = document.getElementById('logout-modal');
                if (this.modal) {
                    console.log('[LogoutModal] Modal found in DOM');
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Initial check
        this.modal = document.getElementById('logout-modal');
    }

    showModal() {
        this.modal = this.modal || document.getElementById('logout-modal');

        if (this.modal) {
            console.log('[LogoutModal] Showing modal');
            // Use flex display for proper centering
            this.modal.style.display = 'flex';

            // Ensure modal is visible (remove any conflicting classes)
            this.modal.classList.remove('hidden');

            // Focus on the cancel button for accessibility
            setTimeout(() => {
                const cancelBtn = document.getElementById('logout-cancel');
                if (cancelBtn) cancelBtn.focus();
            }, 100);
        } else {
            console.error('[LogoutModal] Modal not found in DOM');
            // Fallback: Try to create modal if it doesn't exist
            this.createModalFallback();
        }
    }

    hideModal() {
        this.modal = this.modal || document.getElementById('logout-modal');

        if (this.modal) {
            console.log('[LogoutModal] Hiding modal');
            this.modal.style.display = 'none';
        }
    }

    async handleLogout() {
        console.log('[LogoutModal] Starting logout process');

        try {
            // Hide modal first
            this.hideModal();

            // Check if electronAPI is available
            if (window.electronAPI && window.electronAPI.signOutUser) {
                console.log('[LogoutModal] Calling electronAPI.signOutUser');
                try {
                    await window.electronAPI.signOutUser();
                } catch (apiError) {
                    console.error('[LogoutModal] API error:', apiError);
                }
            } else {
                console.log('[LogoutModal] electronAPI not available');
            }

            // Clear storage
            console.log('[LogoutModal] Clearing storage');
            localStorage.clear();
            sessionStorage.clear();

            // Small delay to ensure everything is processed
            setTimeout(() => {
                console.log('[LogoutModal] Navigating to auth.html');
                window.location.href = 'auth.html';
            }, 100);

        } catch (error) {
            console.error('[LogoutModal] Logout error:', error);

            // Still navigate on error
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'auth.html';
        }
    }

    createModalFallback() {
        console.log('[LogoutModal] Creating modal fallback');

        // Check if modal already exists
        if (document.getElementById('logout-modal')) {
            this.modal = document.getElementById('logout-modal');
            this.showModal();
            return;
        }

        // Create modal HTML
        const modalHTML = `
        <div class="modal" id="logout-modal" style="display: none;">
            <div class="modal-content logout-modal-content">
                <div class="modal-header">
                    <h3>Çıkış Yap</h3>
                </div>
                <div class="modal-body">
                    <p>Oturumu kapatmak istediğinize emin misiniz?</p>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="logout-cancel">İptal Et</button>
                        <button class="btn btn-primary" id="logout-confirm">Çıkış Yap</button>
                    </div>
                </div>
            </div>
        </div>`;

        // Add to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get reference and show
        this.modal = document.getElementById('logout-modal');
        this.showModal();
    }
}

// Initialize globally
window.logoutModalHandler = new LogoutModalHandler();

console.log('[LogoutModal] Logout modal handler initialized');