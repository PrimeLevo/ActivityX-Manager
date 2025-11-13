// Supabase configuration
const { createClient } = require('@supabase/supabase-js')

// Using your actual Supabase credentials
const supabaseUrl = 'https://btkiqffcjvjyqyokccfh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2lxZmZjanZqeXF5b2tjY2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODc3OTQsImV4cCI6MjA2NjA2Mzc5NH0.9OHJcPdD-GIpBiUZuLl8NySwj5e0W4-JtV1u2o5LA9U'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to translate Supabase error messages to Turkish
function translateAuthError(errorMessage) {
    const translations = {
        'Invalid login credentials': 'Geçersiz e-posta veya şifre.',
        'Email not confirmed': 'E-posta adresi doğrulanmamış.',
        'User not found': 'Kullanıcı bulunamadı.',
        'Password is too weak': 'Şifre çok zayıf.',
        'Email already registered': 'E-posta adresi zaten kayıtlı.',
        'User already registered': 'Kullanıcı zaten kayıtlı.',
        'Too many requests': 'Çok fazla istek. Lütfen bekleyiniz.',
        'Network error': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
        'Database error': 'Veritabanı hatası. Lütfen tekrar deneyiniz.'
    };

    return translations[errorMessage] || 'Bir hata oluştu. Lütfen tekrar deneyiniz.';
}

// Auth helper functions
async function signUpUser(userData) {
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    display_name: `${userData.firstName} ${userData.lastName}`
                }
            }
        })

        if (authError) {
            return {
                success: false,
                message: translateAuthError(authError.message)
            }
        }

        // Create user profile
        if (authData.user) {
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .insert([{
                    id: authData.user.id,
                    email: userData.email,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    law_firm_id: null // Admin will assign law firm
                }])

            if (profileError) {
                console.error('Profile creation error:', profileError)
                // Auth user was created but profile failed
                return {
                    success: true,
                    message: 'Account created but profile setup incomplete. Contact admin.',
                    user: authData.user
                }
            }

            return {
                success: true,
                user: authData.user
            }
        }

        return {
            success: false,
            message: 'User creation failed'
        }
    } catch (error) {
        console.error('Signup error:', error)
        return {
            success: false,
            message: 'An error occurred during signup'
        }
    }
}

async function signInUser(email, password) {
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (authError) {
            return {
                success: false,
                message: translateAuthError(authError.message)
            }
        }

        // Check if user has a profile and get law firm details
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select(`
                *,
                law_firms (
                    id,
                    name
                )
            `)
            .eq('id', authData.user.id)
            .single()

        console.log('Profile query result:', { profileData, profileError });

        if (profileError || !profileData) {
            console.error('Profile error:', profileError);
            return {
                success: false,
                message: 'User profile not found. Contact admin.'
            }
        }

        if (!profileData.law_firm_id) {
            return {
                success: false,
                message: 'Hesabınız henüz aktif değil, aktif olduğunda giriş yapın.'
            }
        }

        return {
            success: true,
            user: {
                ...authData.user,
                profile: {
                    ...profileData,
                    law_firm_name: profileData.law_firms?.name || 'Hukuk Bürosu'
                }
            }
        }
    } catch (error) {
        console.error('Signin error:', error)
        return {
            success: false,
            message: 'An error occurred during signin'
        }
    }
}

async function signOutUser() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Signout error:', error)
            return false
        }
        return true
    } catch (error) {
        console.error('Signout error:', error)
        return false
    }
}

async function getCurrentUser() {
    try {
        // Get current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return null;
        }

        // Get user profile first
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        console.log('getCurrentUser - Profile query result:', { profileData, profileError });

        if (profileError || !profileData) {
            console.error('getCurrentUser - Profile error:', profileError);
            return null;
        }

        // Get law firm details if user has law_firm_id
        let lawFirmName = 'Hukuk Bürosu';
        if (profileData.law_firm_id) {
            const { data: lawFirmData, error: lawFirmError } = await supabase
                .from('law_firms')
                .select('name')
                .eq('id', profileData.law_firm_id)
                .single();

            console.log('Law firm query result:', { lawFirmData, lawFirmError });

            if (lawFirmData && !lawFirmError) {
                lawFirmName = lawFirmData.name;
            }
        }

        const result = {
            ...user,
            profile: {
                ...profileData,
                law_firm_name: lawFirmName
            }
        };

        console.log('getCurrentUser - Final result:', result);
        console.log('Law firm name used:', lawFirmName);

        return result;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

async function changePassword(newPassword, accessToken) {
    try {
        console.log('changePassword called with new password and access token');

        // Set the session using the access token
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '' // We'll get this from getSession
        });

        if (sessionError) {
            console.error('Session error:', sessionError);
            return {
                success: false,
                message: 'Oturum hatası. Lütfen tekrar giriş yapınız.'
            };
        }

        // Update user password - Supabase official method
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        console.log('Supabase updateUser response:', { data, error });

        if (error) {
            console.error('Change password error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return {
                success: false,
                message: translateAuthError(error.message)
            };
        }

        console.log('Password updated successfully');
        return {
            success: true,
            message: 'Şifre başarıyla değiştirildi.'
        };
    } catch (error) {
        console.error('Change password exception:', error);
        console.error('Exception stack:', error.stack);
        return {
            success: false,
            message: 'Bir hata oluştu. Lütfen tekrar deneyiniz.'
        };
    }
}

module.exports = {
    supabase,
    signUpUser,
    signInUser,
    signOutUser,
    getCurrentUser,
    changePassword
}