/**
 * Profile Page
 */

class ProfilePage {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.originalData = {};
        this.init();
    }

    async init() {
        try {
            await this.loadUserData();
            this.setupEventListeners();
        } catch (error) {
            console.error('[Profile] Init error:', error);
            this.showToast('Profil yüklenirken hata oluştu', 'error');
        }
    }

    async loadUserData() {
        if (!window.electronAPI) {
            throw new Error('Electron API bulunamadı');
        }

        // Try to get current user first
        let sessionData = await window.electronAPI.getCurrentUser();

        console.log('[Profile] getCurrentUser result:', sessionData);

        // If that fails, try getUserSession as fallback
        if (!sessionData || !sessionData.user) {
            console.log('[Profile] Trying getUserSession as fallback...');
            sessionData = await window.electronAPI.getUserSession();
            console.log('[Profile] getUserSession result:', sessionData);
        }

        if (!sessionData || !sessionData.user) {
            throw new Error('Kullanıcı verisi bulunamadı');
        }

        this.currentUser = sessionData.user;
        this.userProfile = sessionData.user.profile || {};

        console.log('[Profile] Current user:', this.currentUser);
        console.log('[Profile] User profile:', this.userProfile);

        this.originalData = {
            firstName: this.userProfile.first_name || '',
            lastName: this.userProfile.last_name || ''
        };

        this.updateUI();
    }

    updateUI() {
        const firstName = this.userProfile.first_name || '';
        const lastName = this.userProfile.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'İsimsiz Kullanıcı';
        const email = this.currentUser.email;
        const firmName = this.userProfile.law_firm_name || 'Belirtilmemiş';

        // Avatar initials
        const initials = this.getInitials(fullName);
        document.getElementById('profile-initials').textContent = initials;

        // Display info
        document.getElementById('profile-name').textContent = fullName;
        document.getElementById('profile-email').textContent = email;
        document.getElementById('profile-firm').textContent = firmName;
        document.getElementById('profile-created').textContent = this.formatDate(this.currentUser.created_at);

        // Form inputs
        document.getElementById('first-name').value = firstName;
        document.getElementById('last-name').value = lastName;
    }

    setupEventListeners() {
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }

        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handlePasswordUpdate(e));
        }

        // Setup password toggle buttons
        this.setupPasswordToggles();
    }

    setupPasswordToggles() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const eyeIcon = button.querySelector('.eye-icon');
                const eyeOffIcon = button.querySelector('.eye-off-icon');

                if (input.type === 'password') {
                    input.type = 'text';
                    eyeIcon.style.display = 'none';
                    eyeOffIcon.style.display = 'block';
                } else {
                    input.type = 'password';
                    eyeIcon.style.display = 'block';
                    eyeOffIcon.style.display = 'none';
                }
            });
        });
    }

    async handleProfileUpdate(e) {
        e.preventDefault();

        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();

        if (!firstName || !lastName) {
            this.showToast('Ad ve soyad alanları zorunludur', 'error');
            return;
        }

        if (firstName === this.originalData.firstName && lastName === this.originalData.lastName) {
            this.showToast('Hiçbir değişiklik yapılmadı');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Kaydediliyor...';

        try {
            // For now, show success but note that we need a backend API to update profile
            this.showToast('Profil güncelleme şu anda kullanılamıyor. Lütfen yöneticinizle iletişime geçin.', 'error');

            // TODO: Need to add update profile API to electronAPI in preload.js and main process

        } catch (error) {
            console.error('[Profile] Update error:', error);
            this.showToast('Güncelleme hatası: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Kaydet';
        }
    }

    resetForm() {
        document.getElementById('first-name').value = this.originalData.firstName;
        document.getElementById('last-name').value = this.originalData.lastName;
        this.showToast('Form sıfırlandı');
    }

    async handlePasswordUpdate(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showToast('Lütfen tüm alanları doldurun', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showToast('Yeni şifre en az 6 karakter olmalıdır', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showToast('Yeni şifreler eşleşmiyor', 'error');
            return;
        }

        if (currentPassword === newPassword) {
            this.showToast('Yeni şifre mevcut şifreden farklı olmalıdır', 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Güncelleniyor...';

        try {
            console.log('[Profile] Calling changePassword API');

            // Get session tokens from main process
            const tokens = await window.electronAPI.getSessionTokens();
            console.log('[Profile] Session tokens retrieved from main process:', !!tokens);

            if (!tokens || !tokens.access_token || !tokens.refresh_token) {
                throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapınız.');
            }

            const { access_token, refresh_token } = tokens;
            console.log('[Profile] Has access token:', !!access_token);
            console.log('[Profile] Has refresh token:', !!refresh_token);

            const result = await window.electronAPI.changePassword({
                currentPassword,
                newPassword,
                accessToken: access_token,
                refreshToken: refresh_token
            });

            console.log('[Profile] Change password result:', result);

            if (result.success) {
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';

                this.showToast('Şifreniz başarıyla güncellendi', 'success');
            } else {
                const errorMsg = result.error || result.message || 'Şifre güncellenemedi';
                console.error('[Profile] Password change failed:', errorMsg);
                throw new Error(errorMsg);
            }

        } catch (error) {
            console.error('[Profile] Password update error:', error);
            this.showToast('Şifre güncellenemedi: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Şifreyi Güncelle';
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const messageEl = document.getElementById('toast-message');

        if (!toast || !messageEl) return;

        messageEl.textContent = message;
        toast.className = 'toast show';
        if (type) toast.classList.add(type);

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    getInitials(name) {
        if (!name || name === 'İsimsiz Kullanıcı') return '?';

        const parts = name.trim().split(' ');
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }

        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatId(id) {
        if (!id) return '-';
        if (id.length > 12) {
            return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
        }
        return id;
    }
}

window.ProfilePage = ProfilePage;
