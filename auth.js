// Authentication page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Form switching functionality
    const showSignupBtn = document.getElementById('show-signup');
    const backToSigninBtn = document.querySelector('.back-to-signin');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    showSignupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signinForm.classList.remove('active');
        signupForm.classList.add('active');
    });

    backToSigninBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupForm.classList.remove('active');
        signinForm.classList.add('active');
    });

    // Sign In Form Handler
    signinForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        const submitBtn = this.querySelector('.auth-btn');

        // Clear any existing messages
        clearMessages();

        // Custom validation with Turkish messages
        if (!email) {
            showError('E-posta adresi zorunludur.');
            return;
        }

        if (!password) {
            showError('Şifre zorunludur.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Geçerli bir e-posta adresi giriniz.');
            return;
        }

        try {
            // Set loading state
            setLoadingState(submitBtn, true);

            // Use real Supabase authentication through Electron API
            const result = await window.electronAPI.signInUser(email, password);

            if (result.success) {
                // Notify Electron main process about successful auth and redirect immediately
                await window.electronAPI.authSuccess(result.user);
            } else {
                showError(result.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            showError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
        } finally {
            setLoadingState(submitBtn, false);
        }
    });

    // Sign Up Form Handler
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const firstName = document.getElementById('signup-firstname').value.trim();
        const lastName = document.getElementById('signup-lastname').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const submitBtn = this.querySelector('.auth-btn');

        // Clear any existing messages
        clearMessages();

        // Custom validation with Turkish messages
        if (!firstName) {
            showError('Ad zorunludur.');
            return;
        }

        if (!lastName) {
            showError('Soyad zorunludur.');
            return;
        }

        if (!email) {
            showError('E-posta adresi zorunludur.');
            return;
        }

        if (!validateEmail(email)) {
            showError('Geçerli bir e-posta adresi giriniz.');
            return;
        }

        if (!password) {
            showError('Şifre zorunludur.');
            return;
        }

        if (password.length < 6) {
            showError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (!confirmPassword) {
            showError('Şifre tekrarı zorunludur.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Şifreler eşleşmiyor.');
            return;
        }

        try {
            // Set loading state
            setLoadingState(submitBtn, true);

            // Use real Supabase authentication and user profile creation through Electron API
            const result = await window.electronAPI.signUpUser({
                firstName,
                lastName,
                email,
                password
            });

            if (result.success) {
                showSuccess('Kayıt başarılı, hesabınız aktif edilecektir.');

                // Clear form
                signupForm.reset();

                // Switch to sign in form after delay
                setTimeout(() => {
                    if (signupForm && signinForm) {
                        signupForm.classList.remove('active');
                        signinForm.classList.add('active');
                    }
                }, 2000);
            } else {
                showError(result.message || 'Kayıt başarısız. Lütfen tekrar deneyiniz.');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            showError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
        } finally {
            setLoadingState(submitBtn, false);
        }
    });

    // Forgot password link handler
    const forgotPasswordLink = document.querySelector('.forgot-password');
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showContactPopup();
    });

    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            const eyeOffIcon = this.querySelector('.eye-off-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'block';
            } else {
                passwordInput.type = 'password';
                eyeIcon.style.display = 'block';
                eyeOffIcon.style.display = 'none';
            }
        });
    });
});

// Temporary mock functions to prevent freezing - will be replaced with real Supabase integration
async function mockSignInUser(email, password) {
    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            if (email === 'test@example.com' && password === 'password') {
                resolve({
                    success: true,
                    user: { email, id: '123' }
                });
            } else {
                resolve({
                    success: false,
                    message: 'Geçersiz e-posta veya şifre.'
                });
            }
        }, 1000);
    });
}

async function mockSignUpUser(userData) {
    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                user: { ...userData, id: Date.now().toString() }
            });
        }, 1500);
    });
}

// Utility functions
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.classList.remove('loading');
    }
}

function showError(message) {
    clearMessages();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const activeForm = document.querySelector('.auth-form.active');
    activeForm.insertBefore(errorDiv, activeForm.firstChild);

    // Auto-dismiss after 5 seconds with fade out animation
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.transition = 'opacity 0.5s ease-out';
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 500);
        }
    }, 5000);
}

function showSuccess(message) {
    clearMessages();
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;

    const activeForm = document.querySelector('.auth-form.active');
    activeForm.insertBefore(successDiv, activeForm.firstChild);

    // Auto-dismiss after 5 seconds with fade out animation
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.style.transition = 'opacity 0.5s ease-out';
            successDiv.style.opacity = '0';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 500);
        }
    }, 5000);
}

function clearMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => msg.remove());
}

function showContactPopup() {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'contact-popup-overlay';

    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'contact-popup';

    popup.innerHTML = `
        <div class="contact-popup-header">
            <h3>Şifre Sıfırlama Desteği</h3>
            <button class="contact-popup-close">&times;</button>
        </div>
        <div class="contact-popup-body">
            <p>Şifrenizi sıfırlamak için lütfen Legalion ile iletişime geçin:</p>
            <div class="contact-info">
                <strong>E-posta:</strong> leventcakmk@gmail.com
            </div>
            <p class="contact-note">Talebiniz en kısa sürede değerlendirilecektir.</p>
        </div>
        <div class="contact-popup-footer">
            <button class="contact-popup-ok">Tamam</button>
        </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Handle close events
    const closeBtn = popup.querySelector('.contact-popup-close');
    const okBtn = popup.querySelector('.contact-popup-ok');

    function closePopup() {
        document.body.removeChild(overlay);
    }

    closeBtn.addEventListener('click', closePopup);
    okBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closePopup();
        }
    });

    // Close on escape key
    function handleEscape(e) {
        if (e.key === 'Escape') {
            closePopup();
            document.removeEventListener('keydown', handleEscape);
        }
    }
    document.addEventListener('keydown', handleEscape);
}

// Input validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Enable text selection and Cmd+A for all inputs
document.addEventListener('DOMContentLoaded', function() {
    const allInputs = document.querySelectorAll('input');

    allInputs.forEach(input => {
        // Enable text selection
        input.style.webkitUserSelect = 'text';
        input.style.userSelect = 'text';

        // Handle Cmd+A / Ctrl+A
        input.addEventListener('keydown', function(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                e.preventDefault();
                this.select();
            }
        });
    });
});

// Real-time validation
document.addEventListener('DOMContentLoaded', function() {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#e9ecef';
            } else {
                this.style.borderColor = '#e9ecef';
            }
        });
    });

    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.id === 'signup-confirm-password') {
                const password = document.getElementById('signup-password').value;
                if (this.value && this.value !== password) {
                    this.style.borderColor = '#e9ecef';
                } else {
                    this.style.borderColor = '#e9ecef';
                }
            } else if (this.id === 'signup-password') {
                if (this.value && !validatePassword(this.value)) {
                    this.style.borderColor = '#e9ecef';
                } else {
                    this.style.borderColor = '#e9ecef';
                }
            }
        });
    });
});