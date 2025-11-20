/**
 * Browser-side Supabase Helper
 * Provides access to Supabase session in the browser context
 */

(function() {
    'use strict';

    // Supabase configuration (same as in supabase-config.js)
    const BROWSER_SUPABASE_URL = 'https://qhqndjmxobebptcwhohw.supabase.co';
    const BROWSER_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFocW5kam14b2JlYnB0Y3dob2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwMTE4MzQsImV4cCI6MjA0NzU4NzgzNH0.WLPHyR_u_5FTFNgU7b0ljRoJVEYFDKyDYEKc0Fhp8Mg';

    class BrowserSupabase {
        constructor() {
            this.supabase = null;
            this.init();
        }

        init() {
            // Check if we're in a browser environment with Supabase loaded
            if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
                console.log('[BrowserSupabase] Initializing Supabase client');
                this.supabase = window.supabase.createClient(BROWSER_SUPABASE_URL, BROWSER_SUPABASE_ANON_KEY, {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: false,
                        storage: window.localStorage
                    }
                });
                console.log('[BrowserSupabase] Supabase client initialized');
            } else {
                console.warn('[BrowserSupabase] Supabase library not available in window');
            }
        }

    async getSession() {
        if (!this.supabase) {
            console.error('[BrowserSupabase] Supabase client not initialized');
            return null;
        }

        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();

            if (error) {
                console.error('[BrowserSupabase] Error getting session:', error);
                return null;
            }

            console.log('[BrowserSupabase] Session retrieved:', {
                hasSession: !!session,
                hasAccessToken: !!session?.access_token,
                hasRefreshToken: !!session?.refresh_token
            });

            return session;
        } catch (error) {
            console.error('[BrowserSupabase] Exception getting session:', error);
            return null;
        }
    }

    async getUser() {
        if (!this.supabase) {
            console.error('[BrowserSupabase] Supabase client not initialized');
            return null;
        }

        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();

            if (error) {
                console.error('[BrowserSupabase] Error getting user:', error);
                return null;
            }

            console.log('[BrowserSupabase] User retrieved:', !!user);
            return user;
        } catch (error) {
            console.error('[BrowserSupabase] Exception getting user:', error);
            return null;
        }
    }

        async getSessionData() {
            const session = await this.getSession();
            const user = await this.getUser();

            if (!session || !user) {
                return null;
            }

            return {
                session,
                user
            };
        }
    }

    // Create global instance
    window.browserSupabase = new BrowserSupabase();

    console.log('[BrowserSupabase] Module loaded');
})();