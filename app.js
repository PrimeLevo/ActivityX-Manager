// Function to clean website names/URLs from browser-specific suffixes
function cleanWebsiteName(name) {
    if (!name) return name;

    // Remove browser names at the end (Microsoft Edge, Chrome, Firefox, Safari)
    let cleanedName = name.replace(/ - Microsoft[\s​]*Edge$/i, '');
    cleanedName = cleanedName.replace(/ - Google Chrome$/i, '');
    cleanedName = cleanedName.replace(/ - Mozilla Firefox$/i, '');
    cleanedName = cleanedName.replace(/ - Firefox$/i, '');
    cleanedName = cleanedName.replace(/ - Safari$/i, '');
    cleanedName = cleanedName.replace(/ - Chrome$/i, '');
    cleanedName = cleanedName.replace(/ - Edge$/i, '');

    // After removing browser names, remove personal/private indicators if they're now at the end
    cleanedName = cleanedName.replace(/ - Kişisel$/i, '');
    cleanedName = cleanedName.replace(/ - Personal$/i, '');
    cleanedName = cleanedName.replace(/ - Private$/i, '');
    cleanedName = cleanedName.replace(/ - InPrivate$/i, '');

    return cleanedName.trim();
}

// Keep the old function name for compatibility but redirect to the new one
function cleanWebsiteTitle(title) {
    return cleanWebsiteName(title);
}

// Loading popup for data updates
function showLoadingPopup(message = 'Veriler yükleniyor...') {
    const existingOverlay = document.getElementById('loading-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        min-width: 300px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #5F8FA8;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    const messageElement = document.createElement('p');
    messageElement.id = 'loading-message';
    messageElement.textContent = message;
    messageElement.style.cssText = `
        margin: 0;
        font-size: 1rem;
        color: #333;
        line-height: 1.4;
    `;

    modal.appendChild(spinner);
    modal.appendChild(messageElement);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    return overlay;
}

function updateLoadingPopup(message) {
    const messageElement = document.getElementById('loading-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
}

function hideLoadingPopup() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Custom Turkish alert function
function turkishAlert(message) {
    // Create custom modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    // Create modal dialog
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 3rem 2rem 1.5rem 2rem;
        min-width: 300px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    // Create message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.cssText = `
        margin: 0 0 1.3rem 0;
        font-size: 1rem;
        color: #333;
        line-height: 1.4;
    `;

    // Create Tamam button
    const button = document.createElement('button');
    button.textContent = 'Tamam';
    button.style.cssText = `
        background: #6B9BB5;
        color: white;
        border: none;
        padding: 0.7rem 1.8rem;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
    `;

    button.onmouseover = () => button.style.background = '#5A8AA3';
    button.onmouseout = () => button.style.background = '#6B9BB5';

    button.onclick = () => document.body.removeChild(overlay);

    // Handle escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Assemble modal
    modal.appendChild(messageElement);
    modal.appendChild(button);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus button for accessibility
    button.focus();
}

// Global variables
let users = [];
// Infinite scroll - no pagination needed
let filteredUsers = [];
let currentPeriod = 'weekly';
let customStartDate = null;
let customEndDate = null;
let activityChart, appsChart, modalAppsChart, modalWebsitesChart;

// Local persistence for cumulative data
const STORAGE_KEY = 'kta_persisted_users_v1';

function loadPersistedUsers() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(u => {
            // Clean website titles in persisted data
            const cleanedUser = {
                ...u,
                lastActivity: u.lastActivity ? new Date(u.lastActivity) : new Date()
            };

            // Clean existing names that have "User" prefix
            if (cleanedUser.name && cleanedUser.name.startsWith('User ')) {
                cleanedUser.name = cleanedUser.name.substring(5); // Remove "User " prefix
            }

            if (cleanedUser.websites && Array.isArray(cleanedUser.websites)) {
                cleanedUser.websites = cleanedUser.websites.map(website => ({
                    ...website,
                    name: cleanWebsiteName(website.name) || website.name,
                    url: cleanWebsiteName(website.url) || website.url
                }));
            }

            return cleanedUser;
        }) : [];
    } catch (e) {
        console.warn('Failed to load persisted users:', e);
        return [];
    }
}

function savePersistedUsers(persistedUsers) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedUsers));
    } catch (e) {
        console.warn('Failed to save users:', e);
    }
}

function mergeCumulativeUsers(existingUsers, incomingUsers) {
    const byKey = new Map();
    existingUsers.forEach(u => {
        const userCopy = JSON.parse(JSON.stringify(u));
        // Convert lastActivity back to Date object if it exists
        if (userCopy.lastActivity) {
            userCopy.lastActivity = new Date(userCopy.lastActivity);
        }
        byKey.set(u.userId || u.id, userCopy);
    });
    incomingUsers.forEach(inU => {
        const key = inU.userId || inU.id;
        const cur = byKey.get(key);
        if (!cur) {
            byKey.set(key, JSON.parse(JSON.stringify(inU)));
            return;
        }
        const inActive = (inU.activeTime && inU.activeTime.total) || 0;
        const curActive = (cur.activeTime && cur.activeTime.total) || 0;
        const mergedActive = curActive + inActive;
        const ah = Math.floor(mergedActive / 3600);
        const am = Math.floor((mergedActive % 3600) / 60);
        const as = Math.floor(mergedActive % 60);
        cur.activeTime = { hours: ah, minutes: am, seconds: as, total: mergedActive };

        const appsMap = new Map();
        (cur.apps || []).forEach(a => appsMap.set(a.name, { ...a }));
        (inU.apps || []).forEach(a => {
            const prev = appsMap.get(a.name) || { name: a.name, usage: 0 };
            prev.usage = Math.max(0, Math.floor((prev.usage || 0) + (a.usage || 0)));
            appsMap.set(a.name, prev);
        });
        cur.apps = Array.from(appsMap.values()).sort((a,b) => b.usage - a.usage);

        const sitesMap = new Map();
        (cur.websites || []).forEach(w => {
            // Clean existing website names and URLs
            const cleanedW = { ...w };
            if (cleanedW.name) {
                cleanedW.name = cleanWebsiteName(cleanedW.name);
            }
            if (cleanedW.url) {
                cleanedW.url = cleanWebsiteName(cleanedW.url);
            }
            sitesMap.set(cleanedW.name || cleanedW.url, cleanedW);
        });
        (inU.websites || []).forEach(w => {
            // Clean the website name and URL
            const cleanedName = cleanWebsiteName(w.name);
            const cleanedUrl = cleanWebsiteName(w.url);
            const k = cleanedName || cleanedUrl || w.name || w.url;
            const prev = sitesMap.get(k) || { name: cleanedName || cleanedUrl || k, title: w.title || k, usage: 0, url: cleanedUrl || w.url || k };
            prev.usage = Math.max(0, Math.floor((prev.usage || 0) + (w.usage || 0)));
            prev.title = prev.title || w.title || k;
            prev.name = cleanedName || prev.name || k;
            prev.url = cleanedUrl || prev.url || w.url || k;
            sitesMap.set(k, prev);
        });
        cur.websites = Array.from(sitesMap.values()).sort((a,b) => b.usage - a.usage);

        cur.name = inU.name || cur.name;
        // Only update lastActivity if incoming user has valid lastActivity
        if (inU.lastActivity && !isNaN(new Date(inU.lastActivity).getTime())) {
            cur.lastActivity = new Date(Math.max(new Date(cur.lastActivity).getTime(), new Date(inU.lastActivity).getTime()));
        }
        // If incoming user has no valid lastActivity, keep existing lastActivity unchanged

        const batchMap = new Map();
        (cur.batchIds || []).forEach(b => batchMap.set(b.batch_id || `${b.d}_${b.ed || ''}`, b));
        (inU.batchIds || []).forEach(b => {
            const keyB = b.batch_id || `${b.d}_${b.ed || ''}`;
            if (!batchMap.has(keyB)) batchMap.set(keyB, b);
        });
        cur.batchIds = Array.from(batchMap.values());

        byKey.set(key, cur);
    });
    return Array.from(byKey.values());
}

// Supabase configuration
const SUPABASE_URL = 'https://btkiqffcjvjyqyokccfh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2lxZmZjanZqeXF5b2tjY2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODc3OTQsImV4cCI6MjA2NjA2Mzc5NH0.9OHJcPdD-GIpBiUZuLl8NySwj5e0W4-JtV1u2o5LA9U';
const TABLE_NAME = 'activity_summary';

// N8N Webhook configuration
const N8N_WEBHOOK_URL = 'https://primary-production-0d50.up.railway.app/webhook/keytrk';

// Sample data for realistic dummy generation
const sampleApps = [
    'VS Code', 'Chrome', 'Slack', 'Microsoft Word', 'Excel', 'PowerPoint', 
    'Outlook', 'Teams', 'Adobe Acrobat', 'Photoshop', 'Finder', 'Safari', 
    'Terminal', 'Figma', 'Notion', 'Spotify', 'Calculator', 'Preview'
];

const sampleWebsites = [
    'Google.com', 'Gmail.com', 'Microsoft.com', 'LinkedIn.com', 'GitHub.com',
    'Stack Overflow', 'YouTube.com', 'Reddit.com', 'Twitter.com', 'Facebook.com',
    'Amazon.com', 'Wikipedia.org', 'BBC.com', 'CNN.com', 'NYTimes.com',
    'LexisNexis', 'Westlaw.com', 'Court Records'
];

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Jessica', 'James', 'Ashley', 'Christopher', 'Amanda', 'Daniel', 'Stephanie', 'Matthew', 'Rebecca', 'Anthony', 'Laura', 'Mark', 'Jennifer', 'Donald', 'Michelle', 'Steven', 'Kimberly'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris'];

// Helper function to generate hash for string IDs
String.prototype.hashCode = function() {
    let hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
};

// Helper function for Turkish-aware case conversion
function normalizeForTurkishSearch(text) {
    if (!text) return '';
    
    // Manual Turkish character mapping (more reliable than locale)
    return text
        .replace(/İ/g, 'i')  // Capital dotted I to lowercase i
        .replace(/I/g, 'ı')  // Capital dotless I to lowercase dotless i
        .replace(/Ğ/g, 'g')  // Capital G with breve
        .replace(/Ü/g, 'u')  // Capital U with diaeresis
        .replace(/Ş/g, 's')  // Capital S with cedilla
        .replace(/Ö/g, 'o')  // Capital O with diaeresis
        .replace(/Ç/g, 'c')  // Capital C with cedilla
        .toLowerCase()       // Convert to lowercase
        .replace(/ı/g, 'i')  // Convert dotless i to regular i for search
        .replace(/ğ/g, 'g')  // Lowercase g with breve
        .replace(/ü/g, 'u')  // Lowercase u with diaeresis
        .replace(/ş/g, 's')  // Lowercase s with cedilla
        .replace(/ö/g, 'o')  // Lowercase o with diaeresis
        .replace(/ç/g, 'c'); // Lowercase c with cedilla
}

// Test function to verify Turkish normalization
function testTurkishNormalization() {
    console.log('Testing Turkish normalization:');
    console.log('İrfan ->', normalizeForTurkishSearch('İrfan'));
    console.log('irfan ->', normalizeForTurkishSearch('irfan'));
    console.log('irf ->', normalizeForTurkishSearch('irf'));
    console.log('İRFAN ->', normalizeForTurkishSearch('İRFAN'));
    
    console.log('\nTesting all Turkish characters:');
    console.log('S ->', normalizeForTurkishSearch('S'));
    console.log('Ş ->', normalizeForTurkishSearch('Ş'));
    console.log('ş ->', normalizeForTurkishSearch('ş'));
    console.log('G ->', normalizeForTurkishSearch('G'));
    console.log('Ğ ->', normalizeForTurkishSearch('Ğ'));
    console.log('ğ ->', normalizeForTurkishSearch('ğ'));
    console.log('U ->', normalizeForTurkishSearch('U'));
    console.log('Ü ->', normalizeForTurkishSearch('Ü'));
    console.log('ü ->', normalizeForTurkishSearch('ü'));
    console.log('O ->', normalizeForTurkishSearch('O'));
    console.log('Ö ->', normalizeForTurkishSearch('Ö'));
    console.log('ö ->', normalizeForTurkishSearch('ö'));
    console.log('C ->', normalizeForTurkishSearch('C'));
    console.log('Ç ->', normalizeForTurkishSearch('Ç'));
    console.log('ç ->', normalizeForTurkishSearch('ç'));
    
    console.log('\nTesting Turkish names:');
    console.log('Şükrü ->', normalizeForTurkishSearch('Şükrü'));
    console.log('sukru ->', normalizeForTurkishSearch('sukru'));
    console.log('Gökhan ->', normalizeForTurkishSearch('Gökhan'));
    console.log('gokhan ->', normalizeForTurkishSearch('gokhan'));
    console.log('Özlem ->', normalizeForTurkishSearch('Özlem'));
    console.log('ozlem ->', normalizeForTurkishSearch('ozlem'));
    console.log('Çağlar ->', normalizeForTurkishSearch('Çağlar'));
    console.log('caglar ->', normalizeForTurkishSearch('caglar'));
}

// Custom tooltip functionality
function initializeCustomTooltips() {
    const tooltipCells = document.querySelectorAll('.table-cell-with-tooltip');

    // Remove any existing tooltip
    const existingTooltip = document.querySelector('.custom-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    document.body.appendChild(tooltip);

    tooltipCells.forEach(cell => {
        cell.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            if (!tooltipText) return;

            tooltip.textContent = tooltipText;
            tooltip.classList.add('show');

            // Position tooltip
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 5) + 'px';
        });

        cell.addEventListener('mouseleave', function() {
            tooltip.classList.remove('show');
        });
    });
}

// Helper function to calculate active time for current period (moved to global scope)
function getActiveTimeForPeriod(user) {
    const today = new Date();
    if (!user.batchIds || user.batchIds.length === 0) {
        return user.activeTime && typeof user.activeTime.total === 'number' ? user.activeTime.total : 0;
    }
    if (currentPeriod === 'daily') {
        const dateStr = today.getFullYear() + '-' +
                       String(today.getMonth() + 1).padStart(2, '0') + '-' +
                       String(today.getDate()).padStart(2, '0');
        return user.batchIds.reduce((sum, batch) => sum + getBatchActivityForDate(batch, dateStr, 'active'), 0);
    } else if (currentPeriod === 'weekly') {
        const monday = new Date(today);
        const dow = today.getDay();
        const offset = dow === 0 ? 6 : dow - 1;
        monday.setDate(today.getDate() - offset);
        monday.setHours(0, 0, 0, 0);
        const weekEnd = new Date(monday.getTime() + (7 * 24 * 60 * 60 * 1000));
        let total = 0;
        user.batchIds.forEach(batch => {
            if (batch.spans_midnight && batch.ed) {
                const sd = new Date(batch.d);
                const ed = new Date(batch.ed);
                if (sd >= monday && sd < weekEnd) total += getBatchActivityForDate(batch, batch.d, 'active');
                if (ed >= monday && ed < weekEnd) total += getBatchActivityForDate(batch, batch.ed, 'active');
            } else {
                const bd = new Date(batch.d);
                if (bd >= monday && bd < weekEnd) total += (batch.at || 0);
            }
        });
        return total;
    } else if (currentPeriod === 'monthly') {
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        let total = 0;
        user.batchIds.forEach(batch => {
            if (batch.spans_midnight && batch.ed) {
                const sd = new Date(batch.d);
                const ed = new Date(batch.ed);
                if (sd >= first && sd <= last) total += getBatchActivityForDate(batch, batch.d, 'active');
                if (ed >= first && ed <= last) total += getBatchActivityForDate(batch, batch.ed, 'active');
            } else {
                const bd = new Date(batch.d);
                if (bd >= first && bd <= last) total += (batch.at || 0);
            }
        });
        return total;
    } else if (currentPeriod === 'annual') {
        const start = new Date(today.getFullYear(), 0, 1);
        let total = 0;
        user.batchIds.forEach(batch => {
            const bd = new Date(batch.d || batch.date_tracked || batch.created_at);
            if (!isNaN(bd)) {
                if (bd >= start) total += (batch.at || 0);
            }
        });
        return total;
    } else if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        let total = 0;
        user.batchIds.forEach(batch => {
            if (batch.spans_midnight && batch.ed) {
                const sd = new Date(batch.d);
                const ed = new Date(batch.ed);
                const batchStart = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate());
                const batchEnd = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate());
                const rangeStart = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate());
                const rangeEnd = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate());
                if (batchStart >= rangeStart && batchStart <= rangeEnd) total += getBatchActivityForDate(batch, batch.d, 'active');
                if (batchEnd >= rangeStart && batchEnd <= rangeEnd) total += getBatchActivityForDate(batch, batch.ed, 'active');
            } else {
                const bd = new Date(batch.d || batch.date_tracked || batch.created_at);
                const batchDateOnly = new Date(bd.getFullYear(), bd.getMonth(), bd.getDate());
                const rangeStart = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate());
                const rangeEnd = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate());
                if (batchDateOnly >= rangeStart && batchDateOnly <= rangeEnd) total += (batch.at || 0);
            }
        });
        return total;
    }
    return 0;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Test Turkish normalization
    testTurkishNormalization();

    const persisted = loadPersistedUsers();
    if (persisted && persisted.length > 0) {
        // Process website data to ensure browser parsing is applied
        users = persisted.map(user => {
            if (user.batchIds && user.batchIds.length > 0) {
                // Reprocess websites to ensure proper browser/website separation
                user.websites = processUserWebsites(user);
            }
            return user;
        });
        filteredUsers = [...users];
    } else {
        users = [];
        filteredUsers = [];
    }
    filterUsersByDateRange(); // Apply initial filtering

    // Apply default sort on initial load
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect && sortSelect.value) {
        sortUsers(sortSelect.value);
    }

    setupEventListeners();
    renderDashboard();
    updateUserTable();
    toggleClearButton(); // Set initial clear button state
    createCharts();
});

// Dummy generator removed – real data only

// Setup event listeners
function setupEventListeners() {
    // Time period selector
    document.querySelectorAll('[data-period]').forEach(btn => {
        btn.addEventListener('click', function() {
            const customDateSelector = document.getElementById('custom-date-selector');

            if (this.dataset.period === 'custom') {
                // Toggle custom popup
                const isVisible = customDateSelector.style.display === 'block';
                if (isVisible) {
                    hideCustomDatePopup();
                } else {
                    showCustomDatePopup();
                }
            } else {
                // Handle other period buttons
                document.querySelector('.btn-secondary.active').classList.remove('active');
                this.classList.add('active');
                currentPeriod = this.dataset.period;
                hideCustomDatePopup();
                customStartDate = null;
                customEndDate = null;
                performDynamicSearch(); // This will apply date/search filters and sorting
                updateCharts();
            }
        });
    });
    
    // Refresh button removed from UI - keeping function for potential future use
    // document.getElementById('refresh-btn').addEventListener('click', function() {
    //     this.innerHTML = '<span class="icon">⏳</span>Refreshing...';
    //     setTimeout(() => {
    //         users = loadPersistedUsers();
    //         filteredUsers = [...users];
    //         filterUsersByDateRange();
    //         renderDashboard();
    //         updateUserTable();
    //         updateCharts();
    //         this.innerHTML = '<span class="icon">🔄</span>Refresh Data';
    //     }, 800);
    // });
    
    // Update data button (Supabase)
    document.getElementById('update-data-btn').addEventListener('click', function() {
        updateDataFromSupabase();
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        // Show custom logout modal
        document.getElementById('logout-modal').style.display = 'block';
    });

    // Logout modal event listeners
    document.getElementById('logout-cancel').addEventListener('click', function() {
        document.getElementById('logout-modal').style.display = 'none';
    });

    document.getElementById('logout-confirm').addEventListener('click', async function() {
        document.getElementById('logout-modal').style.display = 'none';

        try {
            // Fire and forget - don't wait for response
            await window.electronAPI.authLogout();
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback for non-Electron environments
            window.location.href = 'auth.html';
        }
    });

    // Close logout modal when clicking outside
    document.getElementById('logout-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });

    // Search input: no live filtering; handled by Apply Filter button

    // Sort users function (uses global getActiveTimeForPeriod)
    function sortUsers(sortBy) {
        filteredUsers.sort((a, b) => {
            switch(sortBy) {
                case 'name-az':
                    return a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
                case 'name-za':
                    return b.name.localeCompare(a.name, 'tr', { sensitivity: 'base' });
                case 'active-time-desc':
                    return getActiveTimeForPeriod(b) - getActiveTimeForPeriod(a);
                case 'active-time-asc':
                    return getActiveTimeForPeriod(a) - getActiveTimeForPeriod(b);
                case 'last-activity-recent':
                    return new Date(b.lastActivity) - new Date(a.lastActivity);
                case 'last-activity-oldest':
                    return new Date(a.lastActivity) - new Date(b.lastActivity);
                default:
                    return 0;
            }
        });
    }

    // Sort select
    document.getElementById('sort-select').addEventListener('change', function() {
        const sortBy = this.value;
        sortUsers(sortBy);
        updateUserTable();
    });
    
    // Removed per-page selector; always show all
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', function() {
        exportToCSV();
    });

    document.getElementById('modal-export-btn').addEventListener('click', function() {
        exportUserCSV();
    });

    // Modal search functionality
    document.getElementById('modal-apps-search').addEventListener('input', function() {
        filterModalTable('apps', this.value);
    });

    document.getElementById('modal-websites-search').addEventListener('input', function() {
        filterModalTable('websites', this.value);
    });
    
    // Reset All Filters button: reset date, search, and sort to defaults
    document.getElementById('apply-filters-btn').addEventListener('click', function() {
        resetAllFilters();
    });

    // Hitting Enter in search field does nothing (search is already dynamic)
    const searchEl = document.getElementById('search-input');
    if (searchEl) {
        searchEl.addEventListener('keydown', function(e) {
            // Allow important keyboard shortcuts to work normally
            if (e.metaKey || e.ctrlKey) {
                // Allow Cmd+A, Cmd+C, Cmd+V, Cmd+X, etc.
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                // No action needed - search is already dynamic
            }
        });

        // Dynamic search as user types
        searchEl.addEventListener('input', function() {
            performDynamicSearch();
            toggleClearButton();
        });
    }

    // Clear search button functionality
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
                performDynamicSearch();
                toggleClearButton();
                searchInput.focus();
            }
        });
    }
    
    // No pagination controls; showing all users
    
    // Custom date range apply button
    document.getElementById('apply-date-range').addEventListener('click', function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (startDate && endDate) {
            const start = new Date(startDate + 'T00:00:00'); // Force local timezone
            const end = new Date(endDate + 'T23:59:59'); // Force local timezone
            const today = new Date();
            const oneYearAgo = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000));

            // Create date-only objects for proper comparison
            const startDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const selectedStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const selectedEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

            // Validate date range (max 1 year, not in future) - compare dates properly
            if (selectedStart > startDateOnly || selectedEnd > startDateOnly) {
                turkishAlert('Tarihler gelecekte olamaz.');
                return;
            }

            if (start < oneYearAgo) {
                turkishAlert('Başlangıç tarihi 1 yıldan daha eski olamaz.');
                return;
            }

            if (end < start) {
                turkishAlert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
                return;
            }

            // Store dates properly in local timezone to avoid parsing issues
            customStartDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            customEndDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            currentPeriod = 'custom';

            // Update UI
            document.querySelector('.btn-secondary.active').classList.remove('active');
            document.getElementById('custom-btn').classList.add('active');

            hideCustomDatePopup();
            performDynamicSearch(); // This will apply date/search filters and sorting
            updateCharts();
        } else {
            turkishAlert('Lütfen hem başlangıç hem de bitiş tarihini seçiniz.');
        }
    });

    // Custom date range cancel button
    document.getElementById('cancel-date-range').addEventListener('click', function() {
        hideCustomDatePopup();
    });
    
    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('user-modal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

// Custom date popup control functions
function showCustomDatePopup() {
    const popup = document.getElementById('custom-date-selector');
    popup.style.display = 'block';
    initializeDateInputs(false);  // Don't reset values if already set
}

function hideCustomDatePopup() {
    const popup = document.getElementById('custom-date-selector');
    popup.style.display = 'none';
}

// Click outside to close popup
document.addEventListener('click', function(event) {
    const popup = document.getElementById('custom-date-selector');
    const customBtn = document.getElementById('custom-btn');
    const wrapper = document.querySelector('.custom-date-wrapper');

    if (popup && popup.style.display === 'block') {
        if (!wrapper.contains(event.target)) {
            hideCustomDatePopup();
        }
    }
});

// Initialize Turkish Calendar
function initializeTurkishCalendar() {
    // Set calendar to show current month or start date month
    const displayDate = calendarStartDate || new Date();
    calendarCurrentDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);

    updateCalendarDisplay();
    updateSelectedDatesDisplay();
}

// Setup calendar event listeners
function setupCalendarEventListeners() {
    // Navigation buttons
    document.getElementById('prev-month')?.addEventListener('click', function() {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
        updateCalendarDisplay();
    });

    document.getElementById('next-month')?.addEventListener('click', function() {
        calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
        updateCalendarDisplay();
    });
}

// Update calendar display
function updateCalendarDisplay() {
    const currentMonthElement = document.getElementById('current-month');
    const calendarDaysElement = document.getElementById('calendar-days');

    if (!currentMonthElement || !calendarDaysElement) return;

    // Update month/year display
    const monthName = TURKISH_MONTHS[calendarCurrentDate.getMonth()];
    const year = calendarCurrentDate.getFullYear();
    currentMonthElement.textContent = `${monthName} ${year}`;

    // Clear previous days
    calendarDaysElement.innerHTML = '';

    // Get first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), 1);
    // Convert Sunday (0) to Monday (1) based calendar (Sunday becomes 7)
    const startingDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay();

    // Get number of days in current month
    const daysInMonth = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() + 1, 0).getDate();

    // Get number of days in previous month
    const daysInPrevMonth = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), 0).getDate();

    const today = getTurkishDate();
    const maxDate = getTurkishDate(); // Today
    const minDate = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000)); // One year ago

    // Add empty cells for previous month days
    for (let i = startingDayOfWeek - 2; i >= 0; i--) {
        const dayElement = createCalendarDayElement(
            daysInPrevMonth - i,
            true, // other month
            new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() - 1, daysInPrevMonth - i),
            minDate,
            maxDate
        );
        calendarDaysElement.appendChild(dayElement);
    }

    // Add days for current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), day);
        const dayElement = createCalendarDayElement(day, false, dayDate, minDate, maxDate);
        calendarDaysElement.appendChild(dayElement);
    }

    // Fill remaining cells with next month days
    const totalCells = calendarDaysElement.children.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days = 42 cells
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createCalendarDayElement(
            day,
            true, // other month
            new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() + 1, day),
            minDate,
            maxDate
        );
        calendarDaysElement.appendChild(dayElement);
    }
}

// Create calendar day element
function createCalendarDayElement(day, isOtherMonth, date, minDate, maxDate) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;

    // Add classes based on date properties
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    // Check if date is today (using Turkish timezone)
    const todayTurkish = getTurkishDate();
    if (date.toDateString() === todayTurkish.toDateString()) {
        dayElement.classList.add('today');
    }

    // Check if date is outside allowed range
    if (date < minDate || date > maxDate) {
        dayElement.classList.add('disabled');
        return dayElement;
    }

    // Check if date is selected
    if (calendarStartDate && date.toDateString() === calendarStartDate.toDateString()) {
        dayElement.classList.add('selected', 'range-start');
    }
    if (calendarEndDate && date.toDateString() === calendarEndDate.toDateString()) {
        dayElement.classList.add('selected', 'range-end');
    }

    // Check if date is in range
    if (calendarStartDate && calendarEndDate && date > calendarStartDate && date < calendarEndDate) {
        dayElement.classList.add('in-range');
    }

    // Add click handler for non-disabled days
    if (!dayElement.classList.contains('disabled')) {
        dayElement.addEventListener('click', function() {
            handleDateClick(date);
        });
    }

    return dayElement;
}

// Handle date click
function handleDateClick(date) {
    if (!calendarStartDate || (calendarStartDate && calendarEndDate)) {
        // Start new selection
        calendarStartDate = new Date(date);
        calendarEndDate = null;
        isSelectingEndDate = true;
    } else if (isSelectingEndDate) {
        // Select end date
        if (date >= calendarStartDate) {
            calendarEndDate = new Date(date);
            isSelectingEndDate = false;
        } else {
            // If selected date is before start date, make it the new start date
            calendarEndDate = calendarStartDate;
            calendarStartDate = new Date(date);
            isSelectingEndDate = false;
        }
    }

    updateCalendarDisplay();
    updateSelectedDatesDisplay();
}

// Update selected dates display
function updateSelectedDatesDisplay() {
    const startDisplayElement = document.getElementById('start-date-display');
    const endDisplayElement = document.getElementById('end-date-display');

    if (startDisplayElement) {
        startDisplayElement.textContent = calendarStartDate ?
            formatDateForDisplay(calendarStartDate) : 'Seçiniz';
    }

    if (endDisplayElement) {
        endDisplayElement.textContent = calendarEndDate ?
            formatDateForDisplay(calendarEndDate) : 'Seçiniz';
    }
}

// Initialize date inputs with proper constraints
function initializeDateInputs(resetValues = true) {
    const today = new Date();
    const oneYearAgo = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000));

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    // Set max date to today (use local timezone to avoid UTC conversion issues)
    const todayStr = today.getFullYear() + '-' +
                     String(today.getMonth() + 1).padStart(2, '0') + '-' +
                     String(today.getDate()).padStart(2, '0');
    const oneYearAgoStr = oneYearAgo.getFullYear() + '-' +
                         String(oneYearAgo.getMonth() + 1).padStart(2, '0') + '-' +
                         String(oneYearAgo.getDate()).padStart(2, '0');

    startDateInput.max = todayStr;
    startDateInput.min = oneYearAgoStr;
    endDateInput.max = todayStr;
    endDateInput.min = oneYearAgoStr;

    // Only set default values if resetValues is true or inputs are empty
    if (resetValues || (!startDateInput.value && !endDateInput.value)) {
        // Set default values (last 30 days)
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];
        endDateInput.value = todayStr;
    } else if (customStartDate && customEndDate) {
        // If we have custom dates stored, use them (format properly in local timezone)
        startDateInput.value = customStartDate.getFullYear() + '-' +
                              String(customStartDate.getMonth() + 1).padStart(2, '0') + '-' +
                              String(customStartDate.getDate()).padStart(2, '0');
        endDateInput.value = customEndDate.getFullYear() + '-' +
                            String(customEndDate.getMonth() + 1).padStart(2, '0') + '-' +
                            String(customEndDate.getDate()).padStart(2, '0');
    }
}

// Filter users based on the current date range
function filterUsersByDateRange() {
    if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        // Filter users based on custom date range
        filteredUsers = users.filter(user => {
            if (!user.batchIds || user.batchIds.length === 0) {
                return false; // No batch data, exclude
            }
            
            // Check if user has any activity within the date range
            return user.batchIds.some(batch => {
                // Handle midnight-spanning batches
                if (batch.spans_midnight && batch.ed) {
                    const startDate = new Date(batch.d);
                    const endDate = new Date(batch.ed);

                    // Create date-only versions for comparison (ignore time)
                    const batchStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    const batchEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                    const rangeStart = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate());
                    const rangeEnd = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate());

                    // Include if either start or end date falls within the range
                    return (batchStart >= rangeStart && batchStart <= rangeEnd) ||
                           (batchEnd >= rangeStart && batchEnd <= rangeEnd);
                } else {
                    // Normal batch processing - compare dates only, not time
                    const batchDate = new Date(batch.d || batch.date_tracked || batch.created_at);
                    const batchDateOnly = new Date(batchDate.getFullYear(), batchDate.getMonth(), batchDate.getDate());
                    const rangeStart = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate());
                    const rangeEnd = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate());

                    return batchDateOnly >= rangeStart && batchDateOnly <= rangeEnd;
                }
            });
        });
    } else if (currentPeriod === 'annual') {
        // Filter users for the last year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        filteredUsers = users.filter(user => {
            if (!user.batchIds || user.batchIds.length === 0) {
                return true; // Include dummy data users
            }
            
            return user.batchIds.some(batch => {
                // Handle midnight-spanning batches
                if (batch.spans_midnight && batch.ed) {
                    const startDate = new Date(batch.d);
                    const endDate = new Date(batch.ed);
                    // Include if either start or end date is within the last year
                    return startDate >= oneYearAgo || endDate >= oneYearAgo;
                } else {
                    // Normal batch processing
                    const batchDate = new Date(batch.d || batch.date_tracked || batch.created_at);
                    return batchDate >= oneYearAgo;
                }
            });
        });
    } else {
        // For daily, weekly, monthly - filter users based on activity in the current period
        filteredUsers = users.filter(user => {
            // Calculate activity for the current period
            const today = new Date();
            if (!user.batchIds || user.batchIds.length === 0) {
                // For users without batch data, include them if they have any total active time
                return user.activeTime && typeof user.activeTime.total === 'number' && user.activeTime.total > 0;
            }

            let activityForPeriod = 0;

            if (currentPeriod === 'daily') {
                const dateStr = today.getFullYear() + '-' +
                               String(today.getMonth() + 1).padStart(2, '0') + '-' +
                               String(today.getDate()).padStart(2, '0');
                activityForPeriod = user.batchIds.reduce((sum, batch) => sum + getBatchActivityForDate(batch, dateStr, 'active'), 0);
            } else if (currentPeriod === 'weekly') {
                const monday = new Date(today);
                const dow = today.getDay();
                const offset = dow === 0 ? 6 : dow - 1;
                monday.setDate(today.getDate() - offset);
                monday.setHours(0, 0, 0, 0); // Set to start of day
                const weekEnd = new Date(monday.getTime() + (7 * 24 * 60 * 60 * 1000));
                user.batchIds.forEach(batch => {
                    if (batch.spans_midnight && batch.ed) {
                        const sd = new Date(batch.d);
                        const ed = new Date(batch.ed);
                        if (sd >= monday && sd < weekEnd) activityForPeriod += getBatchActivityForDate(batch, batch.d, 'active');
                        if (ed >= monday && ed < weekEnd) activityForPeriod += getBatchActivityForDate(batch, batch.ed, 'active');
                    } else {
                        const bd = new Date(batch.d);
                        if (bd >= monday && bd < weekEnd) activityForPeriod += (batch.at || 0);
                    }
                });
            } else if (currentPeriod === 'monthly') {
                const first = new Date(today.getFullYear(), today.getMonth(), 1);
                const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                user.batchIds.forEach(batch => {
                    if (batch.spans_midnight && batch.ed) {
                        const sd = new Date(batch.d);
                        const ed = new Date(batch.ed);
                        if (sd >= first && sd <= last) activityForPeriod += getBatchActivityForDate(batch, batch.d, 'active');
                        if (ed >= first && ed <= last) activityForPeriod += getBatchActivityForDate(batch, batch.ed, 'active');
                    } else {
                        const bd = new Date(batch.d);
                        if (bd >= first && bd <= last) activityForPeriod += (batch.at || 0);
                    }
                });
            }

            // Only include users with activity > 0 for the current period
            return activityForPeriod > 0;
        });
    }

    // Note: updateUserTable() is called by the caller after sorting is applied
}

// Generate chart data based on current period and date range
function generateChartData() {
    let labels = [];
    let data = [];
    // Use all filtered users for averaging
    const visibleUsers = filteredUsers;
    
    if (currentPeriod === 'daily') {
        // Show only today's data centered on the graph
        const today = new Date();
        labels = [];
        data = [];

        // Add empty data point before
        labels.push('');
        data.push(null);

        // Add today's data in the middle
        labels.push(today.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }));
        const dayActivity = (function() {
            const dateStr = today.getFullYear() + '-' +
                           String(today.getMonth() + 1).padStart(2, '0') + '-' +
                           String(today.getDate()).padStart(2, '0');
            let total = 0;
            visibleUsers.forEach(user => {
                if (user.batchIds) {
                    user.batchIds.forEach(batch => {
                        total += getBatchActivityForDate(batch, dateStr, 'active');
                    });
                }
            });
            return total;
        })();
        const avgActivity = dayActivity / Math.max(1, visibleUsers.length);
        data.push(Math.round(avgActivity));

        // Add empty data point after
        labels.push('');
        data.push(null);
    } else if (currentPeriod === 'weekly') {
        // Show average daily activity for current week
        const today = new Date();
        const monday = new Date(today);
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        monday.setDate(today.getDate() - mondayOffset);
        monday.setHours(0, 0, 0, 0); // Ensure we start at midnight

        labels = [];
        data = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);

            // Format date as "4 Eki"
            const dayNum = day.getDate();
            const monthShort = day.toLocaleDateString('tr-TR', { month: 'short' });
            labels.push(`${dayNum} ${monthShort}`);

            const dateStr = day.getFullYear() + '-' +
                           String(day.getMonth() + 1).padStart(2, '0') + '-' +
                           String(day.getDate()).padStart(2, '0');
            let total = 0;
            visibleUsers.forEach(user => {
                if (user.batchIds) {
                    user.batchIds.forEach(batch => {
                        total += getBatchActivityForDate(batch, dateStr, 'active');
                    });
                }
            });
            const avgActivity = total / Math.max(1, visibleUsers.length);
            data.push(Math.round(avgActivity));
        }
    } else if (currentPeriod === 'monthly') {
        // Show average weekly activity for current month
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const weeks = Math.ceil(lastDay.getDate() / 7);
        
        labels = [];
        data = [];
        
        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date(firstDay);
            weekStart.setDate(1 + (i * 7));
            const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
            const startDay = weekStart.getDate();
            const endDay = weekEnd.getDate();

            // Check if week spans multiple months
            if (weekStart.getMonth() === weekEnd.getMonth()) {
                // Same month
                const monthName = weekStart.toLocaleDateString('tr-TR', { month: 'short' });
                labels.push(`${startDay}-${endDay} ${monthName}`);
            } else {
                // Different months
                const startMonthName = weekStart.toLocaleDateString('tr-TR', { month: 'short' });
                const endMonthName = weekEnd.toLocaleDateString('tr-TR', { month: 'short' });
                labels.push(`${startDay} ${startMonthName} - ${endDay} ${endMonthName}`);
            }
            const avgActivity = (function() {
                const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
                let total = 0;
                visibleUsers.forEach(user => {
                    if (user.batchIds) {
                        user.batchIds.forEach(batch => {
                            if (batch.spans_midnight && batch.ed) {
                                const startDate = new Date(batch.d);
                                const endDate = new Date(batch.ed);
                                if (startDate >= weekStart && startDate < weekEnd) total += getBatchActivityForDate(batch, batch.d, 'active');
                                if (endDate >= weekStart && endDate < weekEnd) total += getBatchActivityForDate(batch, batch.ed, 'active');
                            } else {
                                const batchDate = new Date(batch.d);
                                if (batchDate >= weekStart && batchDate < weekEnd) total += (batch.at || 0);
                            }
                        });
                    }
                });
                return total / Math.max(1, visibleUsers.length);
            })();
            data.push(Math.round(avgActivity));
        }
    } else if (currentPeriod === 'annual') {
        // Show average monthly activity for current year
        const today = new Date();
        const year = today.getFullYear();
        
        labels = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        data = [];
        
        for (let month = 0; month < 12; month++) {
            const monthStart = new Date(year, month, 1);
            const avgActivity = (function() {
                const monthEnd = new Date(monthStart.getTime() + (30 * 24 * 60 * 60 * 1000));
                let total = 0;
                visibleUsers.forEach(user => {
                    if (user.batchIds) {
                        user.batchIds.forEach(batch => {
                            if (batch.spans_midnight && batch.ed) {
                                const startDate = new Date(batch.d);
                                const endDate = new Date(batch.ed);
                                if (startDate >= monthStart && startDate < monthEnd) total += getBatchActivityForDate(batch, batch.d, 'active');
                                if (endDate >= monthStart && endDate < monthEnd) total += getBatchActivityForDate(batch, batch.ed, 'active');
                            } else {
                                const batchDate = new Date(batch.d);
                                if (batchDate >= monthStart && batchDate < monthEnd) total += (batch.at || 0);
                            }
                        });
                    }
                });
                return total / Math.max(1, visibleUsers.length);
            })();
            data.push(Math.round(avgActivity));
        }
    } else if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        // Generate labels based on custom date range
        console.log('Custom date range chart generation:');
        console.log('customStartDate:', customStartDate);
        console.log('customEndDate:', customEndDate);
        const daysDiff = Math.ceil((customEndDate - customStartDate) / (1000 * 60 * 60 * 24));
        console.log('daysDiff:', daysDiff);

        if (daysDiff === 0) {
            // Single day selected - add empty padding before and after to center the day
            labels = [];
            data = [];

            // Add empty data point before
            labels.push('');
            data.push(null);

            // Add the actual day in the middle
            const date = customStartDate;
            labels.push(date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }));
            const dayActivity = calculateDayActivity(date);
            const avgActivity = dayActivity / Math.max(1, visibleUsers.length);
            data.push(Math.round(avgActivity));

            // Add empty data point after
            labels.push('');
            data.push(null);
        } else if (daysDiff <= 7) {
            // Show daily for week or less
            labels = [];
            data = [];
            for (let i = 0; i <= daysDiff; i++) {
                const date = new Date(customStartDate.getTime() + (i * 24 * 60 * 60 * 1000));
                labels.push(date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }));
                // Calculate average activity for this date
                const dayActivity = calculateDayActivity(date);
                const avgActivity = dayActivity / Math.max(1, visibleUsers.length);
                data.push(Math.round(avgActivity));
            }
        } else if (daysDiff <= 31) {
            // Show weekly groupings for month or less
            const weeks = Math.ceil(daysDiff / 7);
            labels = [];
            data = [];
            for (let i = 0; i < weeks; i++) {
                const weekStart = new Date(customStartDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
                const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
                const startDay = weekStart.getDate();
                const endDay = weekEnd.getDate();

                // Check if week spans multiple months
                if (weekStart.getMonth() === weekEnd.getMonth()) {
                    // Same month
                    const monthName = weekStart.toLocaleDateString('tr-TR', { month: 'short' });
                    labels.push(`${startDay}-${endDay} ${monthName}`);
                } else {
                    // Different months
                    const startMonthName = weekStart.toLocaleDateString('tr-TR', { month: 'short' });
                    const endMonthName = weekEnd.toLocaleDateString('tr-TR', { month: 'short' });
                    labels.push(`${startDay} ${startMonthName} - ${endDay} ${endMonthName}`);
                }
                const weekActivity = (function() {
                    const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
                    let total = 0;
                    visibleUsers.forEach(user => {
                        if (user.batchIds) {
                            user.batchIds.forEach(batch => {
                                if (batch.spans_midnight && batch.ed) {
                                    const startDate = new Date(batch.d);
                                    const endDate = new Date(batch.ed);
                                    if (startDate >= weekStart && startDate < weekEnd) total += getBatchActivityForDate(batch, batch.d, 'active');
                                    if (endDate >= weekStart && endDate < weekEnd) total += getBatchActivityForDate(batch, batch.ed, 'active');
                                } else {
                                    const batchDate = new Date(batch.d);
                                    if (batchDate >= weekStart && batchDate < weekEnd) total += (batch.at || 0);
                                }
                            });
                        }
                    });
                    return total;
                })();
                const avgActivity = weekActivity / Math.max(1, visibleUsers.length);
                data.push(Math.round(avgActivity));
            }
        } else {
            // Show monthly groupings for longer periods
            const months = Math.ceil(daysDiff / 30);
            labels = [];
            data = [];
            for (let i = 0; i < months; i++) {
                const monthStart = new Date(customStartDate.getTime() + (i * 30 * 24 * 60 * 60 * 1000));
                labels.push(monthStart.toLocaleDateString('tr-TR', { month: 'short' }));
                const monthActivity = (function() {
                    const monthEnd = new Date(monthStart.getTime() + (30 * 24 * 60 * 60 * 1000));
                    let total = 0;
                    visibleUsers.forEach(user => {
                        if (user.batchIds) {
                            user.batchIds.forEach(batch => {
                                if (batch.spans_midnight && batch.ed) {
                                    const startDate = new Date(batch.d);
                                    const endDate = new Date(batch.ed);
                                    if (startDate >= monthStart && startDate < monthEnd) total += getBatchActivityForDate(batch, batch.d, 'active');
                                    if (endDate >= monthStart && endDate < monthEnd) total += getBatchActivityForDate(batch, batch.ed, 'active');
                                } else {
                                    const batchDate = new Date(batch.d);
                                    if (batchDate >= monthStart && batchDate < monthEnd) total += (batch.at || 0);
                                }
                            });
                        }
                    });
                    return total;
                })();
                const avgActivity = monthActivity / Math.max(1, visibleUsers.length);
                data.push(Math.round(avgActivity));
            }
        }
    }
    // Convert seconds -> minutes for readability
    const dataInMinutes = data.map(v => {
        const minutes = v / 60;
        return Math.round(minutes * 10) / 10; // one decimal place
    });
    
    return { labels, data: dataInMinutes };
}

// Helper function to get activity for a specific date, handling midnight-spanning batches
function getBatchActivityForDate(batch, targetDateStr, activityType = 'active') {
    // Check if this batch spans midnight
    if (batch.spans_midnight && batch.ed) {
        const startDate = batch.d;
        const endDate = batch.ed;
        const totalTime = batch.tt || 0;
        const timeBeforeMidnight = batch.time_before_midnight || 0;
        const timeAfterMidnight = batch.time_after_midnight || 0;
        
        if (totalTime === 0) return 0;
        
        // Calculate proportional distribution
        const activeTime = batch.at || 0;
        const inactiveTime = batch.it || 0;
        
        if (targetDateStr === startDate && timeBeforeMidnight > 0) {
            // For the start date, distribute proportionally based on time before midnight
            const proportion = timeBeforeMidnight / totalTime;
            const result = activityType === 'active' ? activeTime * proportion :
                          activityType === 'inactive' ? inactiveTime * proportion :
                          timeBeforeMidnight;
            
            // Debug logging for midnight-spanning batches
            if (batch.spans_midnight) {
                console.log(`Midnight span - Date: ${targetDateStr}, Type: ${activityType}, Proportion: ${(proportion * 100).toFixed(1)}%, Result: ${result.toFixed(1)}s`);
            }
            
            return result;
        } else if (targetDateStr === endDate && timeAfterMidnight > 0) {
            // For the end date, distribute proportionally based on time after midnight
            const proportion = timeAfterMidnight / totalTime;
            const result = activityType === 'active' ? activeTime * proportion :
                          activityType === 'inactive' ? inactiveTime * proportion :
                          timeAfterMidnight;
            
            // Debug logging for midnight-spanning batches
            if (batch.spans_midnight) {
                console.log(`Midnight span - Date: ${targetDateStr}, Type: ${activityType}, Proportion: ${(proportion * 100).toFixed(1)}%, Result: ${result.toFixed(1)}s`);
            }
            
            return result;
        }
        // If target date doesn't match either start or end date, return 0
        return 0;
    } else {
        // Normal batch that doesn't span midnight
        if (batch.d === targetDateStr) {
            if (activityType === 'active') {
                return batch.at || 0;
            } else if (activityType === 'inactive') {
                return batch.it || 0;
            } else {
                return batch.tt || batch.at || 0; // total time
            }
        }
        return 0;
    }
}

// Helper functions to calculate activity for specific time periods
function calculateDayActivity(date) {
    const dateStr = date.getFullYear() + '-' +
                   String(date.getMonth() + 1).padStart(2, '0') + '-' +
                   String(date.getDate()).padStart(2, '0');
    let totalActivity = 0;

    filteredUsers.forEach(user => {
        if (user.batchIds) {
            user.batchIds.forEach(batch => {
                totalActivity += getBatchActivityForDate(batch, dateStr, 'active');
            });
        }
    });

    return Math.round(totalActivity);
}

function calculateDayInactivity(date) {
    const dateStr = date.toISOString().split('T')[0];
    let totalInactivity = 0;
    
    filteredUsers.forEach(user => {
        if (user.batchIds) {
            user.batchIds.forEach(batch => {
                totalInactivity += getBatchActivityForDate(batch, dateStr, 'inactive');
            });
        }
    });
    
    return Math.round(totalInactivity);
}

function calculateDayTotalTime(date) {
    const dateStr = date.toISOString().split('T')[0];
    let totalTime = 0;
    
    filteredUsers.forEach(user => {
        if (user.batchIds) {
            user.batchIds.forEach(batch => {
                totalTime += getBatchActivityForDate(batch, dateStr, 'total');
            });
        }
    });
    
    return Math.round(totalTime);
}

function calculateHourlyActivity(date, startHour, endHour) {
    // For now, this is a simplified implementation since we don't have hourly breakdown in batch data
    // We'll distribute the daily activity proportionally across the time slots
    const dateStr = date.toISOString().split('T')[0];
    const totalDayActivity = calculateDayActivity(date);
    const userCount = Math.max(1, filteredUsers.length);
    
    // Simple distribution: more activity during work hours (8-20), less during night (20-8)
    let activityMultiplier = 1.0;
    
    if (startHour >= 8 && endHour <= 20) {
        // Work hours - higher activity
        activityMultiplier = 1.5;
    } else if (startHour >= 20 || endHour <= 8) {
        // Night hours - lower activity
        activityMultiplier = 0.3;
    } else {
        // Mixed hours - normal activity
        activityMultiplier = 1.0;
    }
    
    // Calculate average activity for this time slot
    const hourSlotActivity = (totalDayActivity * activityMultiplier) / 6; // 6 time slots in a day
    const avgActivityPerUser = hourSlotActivity / userCount;
    
    return Math.round(avgActivityPerUser);
}

function calculateWeekActivity(weekStart) {
    let totalActivity = 0;
    const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    filteredUsers.forEach(user => {
        if (user.batchIds) {
            user.batchIds.forEach(batch => {
                // Handle midnight-spanning batches
                if (batch.spans_midnight && batch.ed) {
                    const startDate = new Date(batch.d);
                    const endDate = new Date(batch.ed);
                    
                    // Check if start date is in the week range
                    if (startDate >= weekStart && startDate < weekEnd) {
                        totalActivity += getBatchActivityForDate(batch, batch.d, 'active');
                    }
                    
                    // Check if end date is in the week range
                    if (endDate >= weekStart && endDate < weekEnd) {
                        totalActivity += getBatchActivityForDate(batch, batch.ed, 'active');
                    }
                } else {
                    // Normal batch processing
                    const batchDate = new Date(batch.d);
                    if (batchDate >= weekStart && batchDate < weekEnd) {
                        totalActivity += (batch.at || 0);
                    }
                }
            });
        }
    });
    
    return totalActivity;
}

function calculateMonthActivity(monthStart) {
    let totalActivity = 0;
    const monthEnd = new Date(monthStart.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    filteredUsers.forEach(user => {
        if (user.batchIds) {
            user.batchIds.forEach(batch => {
                // Handle midnight-spanning batches
                if (batch.spans_midnight && batch.ed) {
                    const startDate = new Date(batch.d);
                    const endDate = new Date(batch.ed);
                    
                    // Check if start date is in the month range
                    if (startDate >= monthStart && startDate < monthEnd) {
                        totalActivity += getBatchActivityForDate(batch, batch.d, 'active');
                    }
                    
                    // Check if end date is in the month range
                    if (endDate >= monthStart && endDate < monthEnd) {
                        totalActivity += getBatchActivityForDate(batch, batch.ed, 'active');
                    }
                } else {
                    // Normal batch processing
                    const batchDate = new Date(batch.d);
                    if (batchDate >= monthStart && batchDate < monthEnd) {
                        totalActivity += (batch.at || 0);
                    }
                }
            });
        }
    });

    return totalActivity;
}

function renderDashboard() {
    const totalUsers = users.length;
    const avgActiveTime = users.reduce((sum, user) => sum + user.activeTime.total, 0) / totalUsers;
    
    const appCounts = {};
    users.forEach(user => {
        user.apps.forEach(app => {
            appCounts[app.name] = (appCounts[app.name] || 0) + app.usage;
        });
    });
    const topApp = Object.keys(appCounts).reduce((a, b) => appCounts[a] > appCounts[b] ? a : b, '');
    
    const websiteCounts = {};
    users.forEach(user => {
        user.websites.forEach(website => {
            websiteCounts[website.name] = (websiteCounts[website.name] || 0) + website.usage;
        });
    });
    const topWebsite = Object.keys(websiteCounts).reduce((a, b) => websiteCounts[a] > websiteCounts[b] ? a : b, '');
    
    // Statistics elements removed from DOM
    // document.getElementById('total-users').textContent = totalUsers;
    // document.getElementById('avg-active-time').textContent = `${avgActiveTime.toFixed(1)}s`;
    // document.getElementById('top-app').textContent = topApp;
    // document.getElementById('top-website').textContent = topWebsite;
}

function sortUsers(sortBy) {
    filteredUsers.sort((a, b) => {
        switch(sortBy) {
            case 'name-az':
            case 'name':
                return a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
            case 'name-za':
                return b.name.localeCompare(a.name, 'tr', { sensitivity: 'base' });
            case 'active-time-desc':
            case 'active-time':
                return getActiveTimeForPeriod(b) - getActiveTimeForPeriod(a);
            case 'active-time-asc':
                return getActiveTimeForPeriod(a) - getActiveTimeForPeriod(b);
            case 'last-activity-recent':
            case 'last-activity':
                return new Date(b.lastActivity) - new Date(a.lastActivity);
            case 'last-activity-oldest':
                return new Date(a.lastActivity) - new Date(b.lastActivity);
            default:
                return 0;
        }
    });
}

function performDynamicSearch() {
    // Start with all users from the date-filtered set
    filterUsersByDateRange();

    // Get search term from input
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
        // Use Turkish-aware normalization for proper case conversion
        const normalizedSearchTerm = normalizeForTurkishSearch(searchTerm);

        filteredUsers = filteredUsers.filter(user => {
            const normalizedUserName = normalizeForTurkishSearch(user.name);
            return normalizedUserName.includes(normalizedSearchTerm);
        });
    }

    // Re-apply current sort after filtering
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect && sortSelect.value) {
        sortUsers(sortSelect.value);
    }

    // Update the table display
    updateUserTable();
}

function toggleClearButton() {
    const searchInput = document.getElementById('search-input');
    const clearButton = document.getElementById('clear-search');

    if (searchInput && clearButton) {
        if (searchInput.value.trim() !== '') {
            clearButton.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
        }
    }
}

function resetAllFilters() {
    // Reset search field
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }

    // Reset sort to default (name-az)
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.value = 'name-az';
    }

    // Reset date filter to default (weekly)
    // Remove active class from all period buttons
    document.querySelectorAll('[data-period]').forEach(btn => {
        btn.classList.remove('active');
    });

    // Set weekly as active (default)
    const weeklyBtn = document.querySelector('[data-period="weekly"]');
    if (weeklyBtn) {
        weeklyBtn.classList.add('active');
    }

    // Reset global variables
    currentPeriod = 'weekly';
    customStartDate = null;
    customEndDate = null;

    // Hide custom date popup if open
    hideCustomDatePopup();

    // Clear custom date inputs
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';

    // Apply filters and update display
    performDynamicSearch(); // This will apply date filters and empty search

    // Apply the default sort (name-az)
    sortUsers('name-az');

    toggleClearButton(); // Hide clear button since search is empty
    updateCharts();
}

function updateUserTable() {
    const tableBody = document.getElementById('users-table-body');

    // Check if no users found after filtering
    if (filteredUsers.length === 0) {
        tableBody.innerHTML = `
            <tr class="no-users-row">
                <td colspan="6" class="no-users-message">
                    Kayıt bulunamadı lütfen verileri güncelleyiniz veya filtreleri kontrol ediniz
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filteredUsers.map(user => {
        // Calculate active seconds for current period/date constraints for this user
        const activeSecondsForPeriod = getActiveTimeForPeriod(user);
        const y = Math.floor(activeSecondsForPeriod / (86400 * 365));
        const mo = Math.floor((activeSecondsForPeriod % (86400 * 365)) / (86400 * 30));
        const d = Math.floor((activeSecondsForPeriod % (86400 * 30)) / 86400);
        const h = Math.floor((activeSecondsForPeriod % 86400) / 3600);
        const m = Math.floor((activeSecondsForPeriod % 3600) / 60);
        const s = Math.floor(activeSecondsForPeriod % 60);

        let timeDisplay = '';
        if (y > 0) {
            timeDisplay = `${y}y ${mo}a ${d}g`;
        } else if (mo > 0) {
            timeDisplay = `${mo}a ${d}g ${h}s`;
        } else if (d > 0) {
            timeDisplay = `${d}g ${h}s ${m}d`;
        } else {
            timeDisplay = `${h}s ${m}d ${s}sn`;
        }

        return `
        <tr>
            <td>
                <div class="user-name ${user.name.length > 25 ? 'truncated' : ''}" onclick="showFullUserName('${user.name.replace(/'/g, "\\'")}')" title="${user.name.length > 25 ? 'Click to see full name' : ''}">${user.name}</div>
            </td>
            <td>
                <span class="time-badge time-active">
                    ${timeDisplay}
                </span>
            </td>
            <td>
                <div class="apps-list">
                    ${(() => {
                        const realApps = user.apps ? user.apps.filter(app => app.name !== 'No Apps' && app.name !== 'No App' && !shouldFilterApp(app.name)) : [];
                        if (realApps.length > 0) {
                            // Try to show 3 apps, but check if 3rd app name is too long
                            let appsToShow = 2;
                            let remainingCount = realApps.length - 2;

                            if (realApps.length >= 3) {
                                const thirdAppName = formatAppName(realApps[2].name);
                                // If 3rd app name is short enough (8 chars or less), show 3 apps
                                if (thirdAppName.length <= 8) {
                                    appsToShow = 3;
                                    remainingCount = realApps.length - 3;
                                }
                            }

                            return realApps.slice(0, appsToShow).map(app =>
                                `<span class="app-tag">${formatAppName(app.name)}</span>`
                            ).join('') + (remainingCount > 0 ? `<span class="app-tag">+${remainingCount}</span>` : '');
                        }
                        return '<span class="app-tag">Uygulama Verisi Bulunamadı</span>';
                    })()}
                </div>
            </td>
            <td>
                <div class="websites-list">
                    ${(() => {
                        const realWebsites = user.websites ? user.websites.filter(website =>
                            website.name !== 'No Websites' && website.name !== 'No Website') : [];
                        if (realWebsites.length > 0) {
                            return realWebsites.slice(0, 2).map(website => {
                                const displayName = cleanWebsiteName(website.name) || website.title;
                                const shortName = displayName.replace('https://', '').replace('http://', '').substring(0, 20);
                                return `<span class="website-tag" title="${displayName}">${shortName}${displayName.length > 20 ? '...' : ''}</span>`;
                            }).join('') + (realWebsites.length > 2 ? `<span class="website-tag">+${realWebsites.length - 2}</span>` : '');
                        }
                        return '<span class="website-tag">Web Sitesi Verisi Bulunamadı</span>';
                    })()}
                </div>
            </td>
            <td>
                <div class="last-activity">
                    ${formatDate(user.lastActivity)}
                </div>
            </td>
            <td>
                <button class="view-btn" onclick="openUserModal(${user.id})">Detayları Görüntüle</button>
            </td>
        </tr>`;
    }).join('');
    
    // Pagination info removed; showing all users
}

function createCharts() {
    updateChartHeader();
    createActivityChart();
    createAppsChart();
}

// Plugin to show "no data" message in a styled box
const noDataPlugin = {
    id: 'noDataPlugin',
    afterDraw: function(chart, args, options) {
        const { ctx, width, height } = chart;

        // Different messages based on chart type
        const isActivityChart = chart.canvas.id === 'activity-chart';
        const message = isActivityChart ?
            'Kayıt bulunamadı lütfen verileri güncelleyiniz veya filtreleri kontrol ediniz' :
            'Kayıt bulunamadı';

        ctx.save();

        // Calculate box dimensions
        ctx.font = '14px Arial';
        const textWidth = ctx.measureText(message).width;
        const boxWidth = textWidth + 36; // 18px padding on each side
        const boxHeight = 36; // Similar height to button
        const boxX = (width - boxWidth) / 2;
        const boxY = (height - boxHeight) / 2;

        // Draw box background (sage green color)
        ctx.fillStyle = '#7BA098';
        ctx.roundRect = ctx.roundRect || function(x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        };
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
        ctx.fill();

        // Draw text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(message, width / 2, height / 2);

        ctx.restore();
    }
};

// Calculate dynamic Y-axis maximum with 30% buffer
function calculateYAxisMax(data) {
    const maxDataValue = Math.max(...data);
    const maxDataValueInHours = maxDataValue / 60; // Convert minutes to hours

    // Calculate what Y-axis max should be (data takes 70%, leaving 30% buffer)
    const targetMax = maxDataValueInHours / 0.7;

    // Round up to nearest 2-hour increment
    const roundedMax = Math.ceil(targetMax / 2) * 2;

    // Cap at 24 hours (1440 minutes)
    const cappedMax = Math.min(roundedMax, 24);

    // Convert back to minutes for Chart.js
    return cappedMax * 60;
}

function createActivityChart() {
    const ctx = document.getElementById('activity-chart').getContext('2d');

    const chartData = generateChartData();
    const labels = chartData.labels;
    const data = chartData.data;

    // Check if there's no data (all values are 0, null, or undefined)
    const hasData = data.some(value => value !== null && value !== undefined && value > 0);

    // Calculate dynamic Y-axis maximum
    const yAxisMax = calculateYAxisMax(data);

    if (activityChart) {
        activityChart.destroy();
    }

    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hasData ? labels : [],
            datasets: hasData ? [{
                label: currentPeriod === 'daily' ? 'Bugün Ortalama Aktif Süre (saat)' : 'Ortalama Aktivite (saat)',
                data: data,
                borderColor: '#A0C0D6',
                backgroundColor: 'rgba(160, 192, 214, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }] : []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const minutes = context.parsed.y;
                            const seconds = minutes * 60; // Convert minutes back to seconds for formatting
                            return `Ortalama Aktivite: ${formatTimeForTooltip(seconds)}`;
                        }
                    }
                }
            },
            scales: hasData ? {
                y: {
                    beginAtZero: true,
                    max: yAxisMax,
                    grid: {
                        color: '#f0f0f0'
                    },
                    ticks: {
                        stepSize: 120, // 2 hours in minutes
                        callback: function(value) {
                            const hours = Math.round(value / 60);
                            return hours + 's';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false  // Hide vertical grid lines
                    }
                }
            } : {
                y: { display: false },
                x: { display: false }
            },
            layout: {
                padding: 0
            }
        },
        plugins: !hasData ? [noDataPlugin] : []
    });
}

function createAppsChart() {
    const ctx = document.getElementById('apps-chart').getContext('2d');

    const appCounts = {};
    filteredUsers.forEach(user => {
        user.apps.forEach(app => {
            // Skip filtered apps like Lockapp
            if (shouldFilterApp(app.name)) return;
            appCounts[app.name] = (appCounts[app.name] || 0) + app.usage;
        });
    });

    const sortedApps = Object.entries(appCounts)
        .sort(([,a], [,b]) => b - a);

    const top5Apps = sortedApps.slice(0, 5);
    const otherApps = sortedApps.slice(5);

    // Calculate total usage of other apps
    const othersTotalUsage = otherApps.reduce((sum, [, usage]) => sum + usage, 0);

    // Prepare chart data
    let chartLabels = top5Apps.map(([name]) => formatAppName(name));
    let chartData = top5Apps.map(([, usage]) => usage);

    // Add "Diğer" if there are other apps
    if (othersTotalUsage > 0) {
        chartLabels.push('Diğer');
        chartData.push(othersTotalUsage);
    }

    // Check if there's no data
    const hasData = chartData.length > 0 && chartData.some(usage => usage > 0);

    if (appsChart) {
        appsChart.destroy();
    }

    appsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: hasData ? chartLabels : [],
            datasets: hasData ? [{
                data: chartData,
                backgroundColor: [
                    '#324659',  // Even darker biggest slice
                    '#7FACC7',  // Light blue (second biggest)
                    '#7BA098',  // Sage green accent
                    '#1F252E',  // Slightly darker navy
                    '#B8E5E7',  // Slightly darker pale blue
                    '#7EA7A9'   // Extremely slightly darker for "Diğer"
                ],
                borderWidth: 0
            }] : []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: hasData,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const seconds = context.parsed;
                            return formatTimeForTooltip(seconds);
                        }
                    }
                }
            },
            layout: {
                padding: 0
            }
        },
        plugins: !hasData ? [noDataPlugin] : []
    });
}

function updateChartHeader() {
    const chartHeader = document.querySelector('.chart-header h3');
    let headerText = 'Activity Overview';
    const today = new Date();

    if (currentPeriod === 'daily') {
        const todayStr = today.toLocaleDateString('tr-TR');
        headerText = `Aktivite Genel Bakış - Bugün Ortalama (${todayStr})`;
    } else if (currentPeriod === 'weekly') {
        // Calculate Monday to Sunday for the current week
        const monday = new Date(today);
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        monday.setDate(today.getDate() - mondayOffset);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const mondayStr = monday.toLocaleDateString('tr-TR');
        const sundayStr = sunday.toLocaleDateString('tr-TR');
        headerText = `Aktivite Genel Bakış - Haftalık Ortalama (${mondayStr} - ${sundayStr})`;
    } else if (currentPeriod === 'monthly') {
        // Calculate 1st of month to end of month
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const firstStr = firstDay.toLocaleDateString('tr-TR');
        const lastStr = lastDay.toLocaleDateString('tr-TR');
        headerText = `Aktivite Genel Bakış - Aylık Ortalama (${firstStr} - ${lastStr})`;
    } else if (currentPeriod === 'annual') {
        // Calculate January 1st to December 31st
        const firstDay = new Date(today.getFullYear(), 0, 1);
        const lastDay = new Date(today.getFullYear(), 11, 31);

        const firstStr = firstDay.toLocaleDateString('tr-TR');
        const lastStr = lastDay.toLocaleDateString('tr-TR');
        headerText = `Aktivite Genel Bakış - Yıllık Ortalama (${firstStr} - ${lastStr})`;
    } else if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        const startStr = customStartDate.toLocaleDateString('tr-TR');
        const endStr = customEndDate.toLocaleDateString('tr-TR');
        headerText = `Aktivite Genel Bakış - Özel (${startStr} - ${endStr})`;
    }

    chartHeader.textContent = headerText;
}

function updateCharts() {
    updateChartHeader();
    createActivityChart();
    createAppsChart();
}

function filterUserDataByDateRange(user) {
    const filteredUser = JSON.parse(JSON.stringify(user));

    // Get date range for filtering
    const { startDate, endDate } = getDateRangeForPeriod();

    console.log('Current period variable:', currentPeriod);
    console.log('Filtering user data for period:', currentPeriod, 'from', startDate, 'to', endDate);

    // Filter batches based on date_tracked
    if (filteredUser.batchIds) {
        filteredUser.batchIds = filteredUser.batchIds.filter(batch => {
            const batchDateStr = batch.d || batch.batch_data?.d || batch.date_tracked || batch.d?.split?.('T')[0];
            console.log('Checking batch date:', batchDateStr, 'against range:', startDate, 'to', endDate);
            if (!batchDateStr) {
                console.log('No date found in batch, excluding');
                return false;
            }

            const isInRange = batchDateStr >= startDate && batchDateStr <= endDate;
            console.log('Date in range:', isInRange);
            return isInRange;
        });

        console.log('Filtered batches:', filteredUser.batchIds.length, 'out of', user.batchIds.length);
        if (filteredUser.batchIds.length > 0) {
            console.log('Sample filtered batch:', filteredUser.batchIds[0]);
            console.log('Batch keys:', Object.keys(filteredUser.batchIds[0]));

            const batch = filteredUser.batchIds[0];
            console.log('Has batch_data:', !!batch.batch_data);

            // Check if the data is directly in the batch object (not in batch_data)
            console.log('Direct batch structure check:');
            console.log('- d (date):', batch.d);
            console.log('- ap (apps):', !!batch.ap, 'type:', typeof batch.ap, 'keys:', batch.ap ? Object.keys(batch.ap).length : 0);
            if (batch.ap) console.log('- ap content:', batch.ap);
            console.log('- ur (urls):', !!batch.ur, 'type:', typeof batch.ur, 'keys:', batch.ur ? Object.keys(batch.ur).length : 0);
            if (batch.ur) console.log('- ur content:', batch.ur);
            console.log('- at (active time):', batch.at);

            if (batch.batch_data) {
                console.log('batch_data structure:', batch.batch_data);
            }
        }
    }

    // Recalculate active time from filtered batches using the same logic as main table
    let totalActiveTime = 0;
    if (filteredUser.batchIds) {
        const { startDate, endDate } = getDateRangeForPeriod();

        if (currentPeriod === 'daily') {
            // For daily, calculate activity for today only (use local timezone)
            const today = new Date();
            const dateStr = today.getFullYear() + '-' +
                           String(today.getMonth() + 1).padStart(2, '0') + '-' +
                           String(today.getDate()).padStart(2, '0');
            filteredUser.batchIds.forEach(batch => {
                totalActiveTime += getBatchActivityForDate(batch, dateStr, 'active');
            });
        } else if (currentPeriod === 'weekly') {
            // For weekly, sum only days from Monday up to today (not the full week)
            const today = new Date();
            const monday = new Date(today);
            const dayOfWeek = today.getDay();
            const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            monday.setDate(today.getDate() - mondayOffset);
            monday.setHours(0, 0, 0, 0); // Ensure we start at midnight

            // Set today's end time to end of day for comparison
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            filteredUser.batchIds.forEach(batch => {
                if (batch.spans_midnight && batch.ed) {
                    const sd = new Date(batch.d);
                    const ed = new Date(batch.ed);
                    if (sd >= monday && sd <= todayEnd) totalActiveTime += getBatchActivityForDate(batch, batch.d, 'active');
                    if (ed >= monday && ed <= todayEnd) totalActiveTime += getBatchActivityForDate(batch, batch.ed, 'active');
                } else {
                    const bd = new Date(batch.d);
                    if (bd >= monday && bd <= todayEnd) totalActiveTime += (batch.at || 0);
                }
            });
        } else if (currentPeriod === 'monthly') {
            // For monthly, sum only days from 1st of month up to today
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            monthStart.setHours(0, 0, 0, 0); // Start of first day of month

            // Set today's end time to end of day for comparison
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            filteredUser.batchIds.forEach(batch => {
                if (batch.spans_midnight && batch.ed) {
                    const sd = new Date(batch.d);
                    const ed = new Date(batch.ed);
                    if (sd >= monthStart && sd <= todayEnd) totalActiveTime += getBatchActivityForDate(batch, batch.d, 'active');
                    if (ed >= monthStart && ed <= todayEnd) totalActiveTime += getBatchActivityForDate(batch, batch.ed, 'active');
                } else {
                    const bd = new Date(batch.d);
                    if (bd >= monthStart && bd <= todayEnd) totalActiveTime += (batch.at || 0);
                }
            });
        } else if (currentPeriod === 'annual') {
            // For yearly, sum only days from January 1st up to today
            const today = new Date();
            const yearStart = new Date(today.getFullYear(), 0, 1);
            yearStart.setHours(0, 0, 0, 0); // Start of January 1st

            // Set today's end time to end of day for comparison
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            filteredUser.batchIds.forEach(batch => {
                if (batch.spans_midnight && batch.ed) {
                    const sd = new Date(batch.d);
                    const ed = new Date(batch.ed);
                    if (sd >= yearStart && sd <= todayEnd) totalActiveTime += getBatchActivityForDate(batch, batch.d, 'active');
                    if (ed >= yearStart && ed <= todayEnd) totalActiveTime += getBatchActivityForDate(batch, batch.ed, 'active');
                } else {
                    const bd = new Date(batch.d);
                    if (bd >= yearStart && bd <= todayEnd) totalActiveTime += (batch.at || 0);
                }
            });
        } else {
            // For other periods, use simple addition as fallback
            filteredUser.batchIds.forEach(batch => {
                totalActiveTime += (batch.at || batch.batch_data?.at || 0);
            });
        }
    }

    const hours = Math.floor(totalActiveTime / 3600);
    const minutes = Math.floor((totalActiveTime % 3600) / 60);
    const seconds = totalActiveTime % 60;

    filteredUser.activeTime = { hours, minutes, seconds };

    // Rebuild apps and websites from filtered batches
    filteredUser.apps = processUserApps(filteredUser);
    filteredUser.websites = processUserWebsites(filteredUser);

    console.log('Final filtered user:', {
        activeTime: filteredUser.activeTime,
        appsCount: filteredUser.apps.length,
        websitesCount: filteredUser.websites.length
    });

    return filteredUser;
}

function getDateRangeForPeriod() {
    const today = new Date();
    console.log('Today date object:', today);
    console.log('Today ISO string:', today.toISOString());
    let startDate, endDate;

    if (currentPeriod === 'daily') {
        // Use local timezone for daily date
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        console.log('Daily date range (local):', dateStr, 'to', dateStr);
        return { startDate: dateStr, endDate: dateStr };
    } else if (currentPeriod === 'weekly') {
        const dow = today.getDay();
        const offset = dow === 0 ? 6 : dow - 1;
        const monday = new Date(today);
        monday.setDate(today.getDate() - offset);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return {
            startDate: monday.getFullYear() + '-' + String(monday.getMonth() + 1).padStart(2, '0') + '-' + String(monday.getDate()).padStart(2, '0'),
            endDate: sunday.getFullYear() + '-' + String(sunday.getMonth() + 1).padStart(2, '0') + '-' + String(sunday.getDate()).padStart(2, '0')
        };
    } else if (currentPeriod === 'monthly') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        return {
            startDate: firstDay.getFullYear() + '-' + String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + String(firstDay.getDate()).padStart(2, '0'),
            endDate: lastDay.getFullYear() + '-' + String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay.getDate()).padStart(2, '0')
        };
    } else if (currentPeriod === 'annual') {
        const firstDay = new Date(today.getFullYear(), 0, 1);
        const lastDay = new Date(today.getFullYear(), 11, 31);

        return {
            startDate: firstDay.getFullYear() + '-' + String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + String(firstDay.getDate()).padStart(2, '0'),
            endDate: lastDay.getFullYear() + '-' + String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay.getDate()).padStart(2, '0')
        };
    } else if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        return {
            startDate: customStartDate.getFullYear() + '-' + String(customStartDate.getMonth() + 1).padStart(2, '0') + '-' + String(customStartDate.getDate()).padStart(2, '0'),
            endDate: customEndDate.getFullYear() + '-' + String(customEndDate.getMonth() + 1).padStart(2, '0') + '-' + String(customEndDate.getDate()).padStart(2, '0')
        };
    }

    // Fallback to daily (use local timezone)
    const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    return { startDate: dateStr, endDate: dateStr };
}

// Filter out system apps that should not be displayed
function shouldFilterApp(appName) {
    if (!appName) return true;
    const lowerName = appName.toLowerCase();
    return lowerName === 'lockapp';
}

// Convert app names to proper title case
function formatAppName(appName) {
    if (!appName) return appName;

    // Convert to title case (capitalize first letter of each word)
    return appName.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function processUserApps(user) {
    console.log('processUserApps called with user:', user.name, 'batches:', user.batchIds?.length);
    const appsMap = new Map();

    if (user.batchIds) {
        user.batchIds.forEach((batch, index) => {
            console.log(`Batch ${index}:`, {
                hasAp: !!batch.ap,
                hasBatchData: !!batch.batch_data,
                batchKeys: Object.keys(batch)
            });
            const appsData = batch.ap || batch.batch_data?.ap || batch.batch_data?.apps || {};
            console.log(`Batch ${index} appsData:`, appsData, 'type:', typeof appsData);
            if (appsData && typeof appsData === 'object') {
                Object.keys(appsData).forEach(appName => {
                    // Skip filtered apps like Lockapp
                    if (shouldFilterApp(appName)) return;

                    const appUsage = parseFloat(appsData[appName] || 0);
                    const formattedName = formatAppName(appName);

                    const existing = appsMap.get(formattedName) || { name: formattedName, usage: 0 };
                    existing.usage += appUsage;
                    appsMap.set(formattedName, existing);
                });
            }
        });
    }

    const result = Array.from(appsMap.values()).sort((a, b) => b.usage - a.usage);
    console.log('Processed apps:', result.length, 'apps found');
    return result;
}

function processUserWebsites(user) {
    console.log('processUserWebsites called with user:', user.name, 'batches:', user.batchIds?.length);
    const websitesMap = new Map();

    if (user.batchIds) {
        user.batchIds.forEach(batch => {
            const websitesData = batch.ur || batch.batch_data?.ur || batch.batch_data?.urls || {};
            if (websitesData && typeof websitesData === 'object') {
                Object.keys(websitesData).forEach(rawUrl => {
                    const urlData = websitesData[rawUrl];
                    const websiteUsage = parseFloat(urlData.t || urlData.time || urlData || 0);
                    const originalTitle = urlData.ti || urlData.title || rawUrl;

                    // Parse browser data BEFORE cleaning - use rawUrl which might contain the full title
                    let websiteName, browserName;
                    const fullTitle = rawUrl; // rawUrl often contains the full "Website - Browser" format

                    if (fullTitle && (fullTitle.includes(' - ') || fullTitle.includes(' — '))) {
                        // Browser is ALWAYS after the LAST dash (either " - " or " — ")
                        const lastRegularDash = fullTitle.lastIndexOf(' - ');
                        const lastEmDash = fullTitle.lastIndexOf(' — ');

                        // Use whichever dash appears last
                        if (lastEmDash > lastRegularDash) {
                            // Firefox style with em dash
                            websiteName = fullTitle.substring(0, lastEmDash);
                            browserName = fullTitle.substring(lastEmDash + 3); // " — " is 3 chars
                        } else {
                            // Chrome/Edge style with regular dash
                            websiteName = fullTitle.substring(0, lastRegularDash);
                            browserName = fullTitle.substring(lastRegularDash + 3); // " - " is 3 chars
                        }
                    } else {
                        // No browser detected, use cleaned names
                        websiteName = cleanWebsiteName(rawUrl);
                        browserName = originalTitle;
                    }

                    const cleanedWebsiteName = cleanWebsiteName(websiteName);
                    const existing = websitesMap.get(cleanedWebsiteName) || {
                        name: cleanedWebsiteName,
                        usage: 0,
                        title: browserName,
                        url: cleanedWebsiteName
                    };
                    existing.usage += websiteUsage;

                    // Update the map with the processed data
                    websitesMap.set(cleanedWebsiteName, existing);
                });
            }
        });
    }

    const result = Array.from(websitesMap.values()).sort((a, b) => b.usage - a.usage);
    console.log('Processed websites:', result.length, 'websites found');
    return result;
}

// Global variable to store current modal user data for CSV export
let currentModalUser = null;

function openUserModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Filter user data based on current date range selection
    const filteredUser = filterUserDataByDateRange(user);

    // Store for CSV export
    currentModalUser = filteredUser;

    console.log('Opening modal for user:', filteredUser);
    console.log('User websites:', filteredUser.websites);
    console.log('User apps:', filteredUser.apps);

    // Populate basic user info
    document.getElementById('modal-user-name').textContent = filteredUser.name;
    document.getElementById('modal-active-time').textContent =
        `${filteredUser.activeTime.hours}s ${filteredUser.activeTime.minutes}d ${Math.floor(filteredUser.activeTime.seconds)}sn`;
    // Inactive time removed from UI

    // Calculate date range
    const dateRange = calculateDateRange(filteredUser);
    document.getElementById('modal-date-range').textContent = dateRange;

    // Calculate daily average active time
    const numberOfDays = calculateNumberOfDays();
    const totalActiveTimeInSeconds = (filteredUser.activeTime.hours * 3600) + (filteredUser.activeTime.minutes * 60) + filteredUser.activeTime.seconds;
    const dailyAverageInSeconds = totalActiveTimeInSeconds / numberOfDays;

    const avgHours = Math.floor(dailyAverageInSeconds / 3600);
    const avgMinutes = Math.floor((dailyAverageInSeconds % 3600) / 60);
    const avgSeconds = Math.floor(dailyAverageInSeconds % 60);

    document.getElementById('modal-daily-average').textContent = `${avgHours}s ${avgMinutes}d ${avgSeconds}sn`;

    // Set day count
    document.getElementById('modal-day-count').textContent = `${numberOfDays} Gün`;

    // Populate detailed tables
    populateAppsTable(filteredUser);
    populateWebsitesTable(filteredUser);

    createModalCharts(filteredUser);

    // Show timeline only if day count is 1
    if (numberOfDays === 1) {
        renderActivityTimeline(filteredUser);
        document.getElementById('modal-timeline-section').style.display = 'block';
    } else {
        document.getElementById('modal-timeline-section').style.display = 'none';
    }

    // Initialize custom tooltips
    initializeCustomTooltips();

    document.getElementById('user-modal').style.display = 'block';
}

function calculateNumberOfDays() {
    const today = new Date();

    if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        const timeDiff = customEndDate.getTime() - customStartDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
    } else if (currentPeriod === 'daily') {
        return 1; // Just today
    } else if (currentPeriod === 'weekly') {
        // Calculate actual days from Monday to today (not full week)
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return mondayOffset + 1; // +1 to include today
    } else if (currentPeriod === 'monthly') {
        // Calculate actual days from 1st of month to today (not full month)
        return today.getDate(); // Today's date number (1-31)
    } else if (currentPeriod === 'annual') {
        // Calculate actual days from January 1st to today (not full year)
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const timeDiff = today.getTime() - yearStart.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include today
    }

    // Fallback: assume 1 day
    return 1;
}

function calculateDateRange(user) {
    const today = new Date();
    
    if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        // Show custom date range
        return `${formatDateForDisplay(customStartDate)} - ${formatDateForDisplay(customEndDate)}`;
    } else if (currentPeriod === 'daily') {
        // Show today's date
        return formatDateForDisplay(today);
    } else if (currentPeriod === 'weekly') {
        // Show current week range (Monday to Today)
        const monday = new Date(today);
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
        monday.setDate(today.getDate() - mondayOffset);

        return `${formatDateForDisplay(monday)} - ${formatDateForDisplay(today)}`;
    } else if (currentPeriod === 'monthly') {
        // Show current month range (1st of month to Today)
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        return `${formatDateForDisplay(firstDay)} - ${formatDateForDisplay(today)}`;
    } else if (currentPeriod === 'annual') {
        // Show current year range (January 1st to Today)
        const firstDay = new Date(today.getFullYear(), 0, 1);

        return `${formatDateForDisplay(firstDay)} - ${formatDateForDisplay(today)}`;
    }
    
    // Fallback: if user has batch data, show the range of dates
    if (user.batchIds && user.batchIds.length > 0) {
        const dates = user.batchIds.flatMap(batch => {
            const allDates = [];
            
            // Add start date
            const startDateStr = batch.d || batch.date_tracked || batch.created_at;
            if (startDateStr) {
                const startDate = new Date(startDateStr);
                if (!isNaN(startDate.getTime())) {
                    allDates.push(startDate);
                }
            }
            
            // Add end date if batch spans midnight
            if (batch.spans_midnight && batch.ed) {
                const endDate = new Date(batch.ed);
                if (!isNaN(endDate.getTime())) {
                    allDates.push(endDate);
                }
            }
            
            return allDates;
        });
        
        if (dates.length > 0) {
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            
            if (minDate.toDateString() === maxDate.toDateString()) {
                return formatDateForDisplay(minDate);
            } else {
                return `${formatDateForDisplay(minDate)} - ${formatDateForDisplay(maxDate)}`;
            }
        }
    }
    
    // Ultimate fallback
    return formatDateForDisplay(user.lastActivity);
}

// Format date for display (DD.MM.YYYY format)
function formatDateForDisplay(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function populateAppsTable(user) {
    const tbody = document.getElementById('modal-apps-table');

    // Filter out apps with invalid usage and system apps like Lockapp
    const validApps = user.apps.filter(app =>
        app.usage !== undefined &&
        app.usage !== null &&
        !isNaN(app.usage) &&
        app.usage > 0 &&
        !shouldFilterApp(app.name)
    );
    
    const totalUsage = validApps.reduce((sum, app) => sum + app.usage, 0);
    
    if (validApps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">Uygulama kullanım verisi bulunamadı.</td></tr>';
        return;
    }
    
    tbody.innerHTML = validApps.map(app => {
        const usage = Math.max(0, Math.floor(app.usage || 0));
        const percentage = totalUsage > 0 ? Math.round((usage / totalUsage) * 100) : 0;
        const years = Math.floor(usage / (86400 * 365));
        const months = Math.floor((usage % (86400 * 365)) / (86400 * 30));
        const days = Math.floor((usage % (86400 * 30)) / 86400);
        const hours = Math.floor((usage % 86400) / 3600);
        const minutes = Math.floor((usage % 3600) / 60);
        const seconds = Math.floor(usage % 60);

        let timeDisplay = '';
        if (years > 0) {
            timeDisplay = `${years}y ${months}a ${days}g`;
        } else if (months > 0) {
            timeDisplay = `${months}a ${days}g ${hours}s`;
        } else if (days > 0) {
            timeDisplay = `${days}g ${hours}s ${minutes}d`;
        } else {
            timeDisplay = `${hours}s ${minutes}d ${seconds}sn`;
        }

        return `
            <tr>
                <td>${formatAppName(app.name) || 'Bilinmeyen Uygulama'}</td>
                <td class="usage-time">${timeDisplay}</td>
                <td><span class="percentage">${percentage}%</span></td>
            </tr>
        `;
    }).join('');
}

function populateWebsitesTable(user) {
    const tbody = document.getElementById('modal-websites-table');
    
    console.log('Debug: user.websites data:', user.websites);
    
    if (!user.websites || user.websites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Web sitesi kullanım verisi bulunamadı.</td></tr>';
        return;
    }
    
    // Process all websites, handling various data formats
    const processedWebsites = user.websites.map(website => {
        // Handle different possible data structures
        let usage = 0;
        if (typeof website.usage === 'number' && !isNaN(website.usage)) {
            usage = Math.max(0, Math.floor(website.usage));
        } else if (typeof website.usage === 'string') {
            const parsed = parseFloat(website.usage);
            usage = isNaN(parsed) ? 0 : Math.max(0, Math.floor(parsed));
        }
        
        return {
            ...website,
            usage: usage,
            title: website.title || website.name || 'Bilinmeyen Web Sitesi',
            url: cleanWebsiteName(website.name || website.url) || 'Bilinmeyen URL'
        };
    }).filter(website => website.usage >= 0); // Show all websites including 0 usage
    
    if (processedWebsites.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Web sitesi kullanım verisi bulunamadı.</td></tr>';
        return;
    }
    
    // Sort by usage descending
    processedWebsites.sort((a, b) => b.usage - a.usage);
    
    const totalUsage = processedWebsites.reduce((sum, website) => sum + website.usage, 0);
    
    tbody.innerHTML = processedWebsites.map(website => {
        const percentage = totalUsage > 0 ? Math.round((website.usage / totalUsage) * 100) : 0;
        const years = Math.floor(website.usage / (86400 * 365));
        const months = Math.floor((website.usage % (86400 * 365)) / (86400 * 30));
        const days = Math.floor((website.usage % (86400 * 30)) / 86400);
        const hours = Math.floor((website.usage % 86400) / 3600);
        const minutes = Math.floor((website.usage % 3600) / 60);
        const seconds = Math.floor(website.usage % 60);

        let timeDisplay = '';
        if (years > 0) {
            timeDisplay = `${years}y ${months}a ${days}g`;
        } else if (months > 0) {
            timeDisplay = `${months}a ${days}g ${hours}s`;
        } else if (days > 0) {
            timeDisplay = `${days}g ${hours}s ${minutes}d`;
        } else {
            timeDisplay = `${hours}s ${minutes}d ${seconds}sn`;
        }

        const displayUrl = website.url.length > 30 ? website.url.substring(0, 30) + '...' : website.url;
        const fullPageTitle = website.name || 'Bilinmeyen Web Sitesi';
        const escapedPageTitle = fullPageTitle.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return `
            <tr>
                <td class="table-cell-with-tooltip" data-tooltip="${escapedPageTitle}">${displayUrl}</td>
                <td class="usage-time">${timeDisplay}</td>
                <td><span class="percentage">${percentage}%</span></td>
            </tr>
        `;
    }).join('');
}

function createModalCharts(user) {
    const appsCtx = document.getElementById('modal-apps-chart').getContext('2d');

    if (modalAppsChart) {
        modalAppsChart.destroy();
    }

    // Filter out system apps and limit to top 10 apps + "Diğer" to prevent X-axis crowding
    const filteredApps = user.apps.filter(app => !shouldFilterApp(app.name));
    const sortedApps = [...filteredApps].sort((a, b) => b.usage - a.usage);
    const topApps = sortedApps.slice(0, 10);
    const remainingApps = sortedApps.slice(10);

    const appChartData = topApps.map(app => app.usage);
    const appLabels = topApps.map(app => formatAppName(app.name));

    // Create background colors array - sage green for "Diğer", default color for others
    const appBackgroundColors = topApps.map(() => '#324659');
    const appBorderColors = topApps.map(() => '#293241');

    if (remainingApps.length > 0) {
        const othersUsage = remainingApps.reduce((sum, app) => sum + app.usage, 0);
        appChartData.push(othersUsage);
        appLabels.push('Diğer');
        appBackgroundColors.push('#7BA098'); // Sage green for "Diğer"
        appBorderColors.push('#7BA098');
    }

    modalAppsChart = new Chart(appsCtx, {
        type: 'bar',
        data: {
            labels: appLabels,
            datasets: [{
                label: 'Kullanılan Süre (saniye)',
                data: appChartData,
                backgroundColor: appBackgroundColors,
                borderColor: appBorderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const seconds = context.parsed.y;
                            return formatTimeForTooltip(seconds);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f0f0f0'
                    },
                    ticks: {
                        callback: function(value) {
                            const minutes = Math.round(value / 60);
                            return minutes + 'dk';
                        }
                    }
                },
                x: {
                    grid: {
                        color: '#f0f0f0'
                    },
                    ticks: {
                        maxRotation: 45
                    }
                }
            },
            layout: {
                padding: 0
            }
        }
    });
    
    const websitesCtx = document.getElementById('modal-websites-chart').getContext('2d');
    
    if (modalWebsitesChart) {
        modalWebsitesChart.destroy();
    }
    
    // Limit to top 22 websites + "Diğer" to prevent modal extension
    const sortedWebsites = [...user.websites].sort((a, b) => b.usage - a.usage);
    const topWebsites = sortedWebsites.slice(0, 22);
    const remainingWebsites = sortedWebsites.slice(22);

    const websiteChartData = topWebsites.map(website => website.usage);
    const websiteLabels = topWebsites.map(website => website.name || 'Bilinmeyen Web Sitesi');

    // Create background colors array
    const websiteColors = ['#324659', '#7FACC7', '#7BA098', '#1F252E', '#B8E5E7'];
    let backgroundColors = topWebsites.map((_, index) => websiteColors[index % websiteColors.length]);

    if (remainingWebsites.length > 0) {
        const othersUsage = remainingWebsites.reduce((sum, website) => sum + website.usage, 0);
        websiteChartData.push(othersUsage);
        websiteLabels.push('Diğer');
        backgroundColors.push('#7BA098'); // Always sage green for "Diğer"
    }

    modalWebsitesChart = new Chart(websitesCtx, {
        type: 'pie',
        data: {
            labels: websiteLabels,
            datasets: [{
                data: websiteChartData,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        usePointStyle: true,
                        font: {
                            size: 10
                        }
                    }
                },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            const seconds = context.parsed;
                            return formatTimeForTooltip(seconds);
                        }
                    }
                }
            },
            layout: {
                padding: 0
            }
        }
    });
}

function closeModal() {
    document.getElementById('user-modal').style.display = 'none';
    // Clear search inputs when closing modal
    document.getElementById('modal-apps-search').value = '';
    document.getElementById('modal-websites-search').value = '';
}

// Filter modal tables based on search input
function filterModalTable(type, searchTerm) {
    const tableId = type === 'apps' ? 'modal-apps-table' : 'modal-websites-table';
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');

    searchTerm = searchTerm.toLowerCase().trim();

    rows.forEach(row => {
        if (searchTerm === '') {
            row.style.display = '';
            return;
        }

        // Get the first cell (app name or website name)
        const firstCell = row.cells[0];
        if (!firstCell) return;

        const text = firstCell.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function formatDate(date) {
    // Check if date is invalid or null/undefined
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Bilinmiyor';
    }

    const now = new Date();
    const diffMilliseconds = now - date;

    // Check for invalid calculation results
    if (isNaN(diffMilliseconds) || diffMilliseconds < 0) {
        return 'Bilinmiyor';
    }

    const diffMinutes = Math.floor(diffMilliseconds / (1000 * 60));
    const diffHours = Math.floor(diffMilliseconds / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
        return 'Şimdi';
    } else if (diffHours < 24) {
        return `${diffHours} saat önce`;
    } else if (diffDays < 30) {
        return `${diffDays} gün önce`;
    } else {
        // Calculate months and years more accurately
        const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 +
                          (now.getMonth() - date.getMonth());

        if (diffMonths < 12) {
            return `${diffMonths} ay önce`;
        } else {
            const diffYears = Math.floor(diffMonths / 12);
            return `${diffYears} yıl önce`;
        }
    }
}

// Supabase functions
async function updateDataFromSupabase() {
    const updateBtn = document.getElementById('update-data-btn');
    const originalContent = updateBtn.innerHTML;

    try {
        // Show loading popup immediately
        showLoadingPopup('Veriler Güncelleniyor');

        // Step 1: Change button state to loading
        updateBtn.innerHTML = 'Veriler Güncelleniyor';
        updateBtn.disabled = true;

        // Step 2: Fetch data from Supabase
        console.log('Fetching data from Supabase...');
        const data = await fetchDataFromSupabase();
        
        if (data && data.length > 0) {
            // Step 3: Get user IDs and fetch real names
            console.log(`Successfully fetched ${data.length} records from Supabase`);
            updateLoadingPopup('Kullanıcı İsimleri Getiriliyor');
            updateBtn.innerHTML = 'Veriler Güncelleniyor';

            const userIds = extractUserIds(data);
            console.log('Extracted user IDs:', userIds);

            const userNames = await fetchUserNames(userIds);
            console.log('Received user names:', userNames);

            // Step 4: Process the data with real names
            updateLoadingPopup('Veriler İnceleniyor');
            updateBtn.innerHTML = 'Veriler Güncelleniyor';
            processSupabaseData(data, userNames);
            // After processing, persist cumulative data
            const persisted = loadPersistedUsers();
            const merged = mergeCumulativeUsers(persisted, users);
            savePersistedUsers(merged);
            users = merged;
            filteredUsers = [...users];
            filterUsersByDateRange();

            // Re-apply current sort after data update
            const sortSelect = document.getElementById('sort-select');
            if (sortSelect && sortSelect.value) {
                sortUsers(sortSelect.value);
            }

            renderDashboard();
            updateUserTable();
            updateCharts();
            
            // Step 5: Update button state
            updateBtn.innerHTML = 'Veriler Güncelleniyor';
            
            // Step 6: Confirm receipt (you can customize this part based on your needs)
            console.log('Confirming data receipt...');
            await confirmDataReceipt(data.length);
            
            // Step 7: Delete all data from Supabase table
            updateLoadingPopup('Kayıtlar İşleniyor');
            updateBtn.innerHTML = 'Veriler Güncelleniyor';
            console.log('Deleting all data from Supabase...');
            await deleteAllDataFromSupabase();
            
            // Step 7: Success
            updateBtn.innerHTML = 'Veriler Güncelleniyor';
            console.log('Data update process completed successfully');

            // Hide loading popup and show success message
            hideLoadingPopup();
            setTimeout(() => {
                turkishAlert('Veriler Başarıyla Güncellendi');
            }, 100);
            
        } else {
            console.log('No data found in Supabase table');
            hideLoadingPopup();
            setTimeout(() => {
                turkishAlert('Veriler Zaten Güncel');
            }, 100);
        }
        
    } catch (error) {
        console.error('Error updating data from Supabase:', error);
        hideLoadingPopup();
        setTimeout(() => {
            turkishAlert('Veri Güncelleme Sırasında Hata Oluştu: ' + error.message);
        }, 100);
    } finally {
        // Reset button after 3 seconds
        setTimeout(() => {
            updateBtn.innerHTML = originalContent;
            updateBtn.disabled = false;
        }, 3000);
    }
}

async function fetchDataFromSupabase() {
    let allData = [];
    let rangeStart = 0;
    const rangeSize = 1000; // Supabase's max limit per request
    let hasMore = true;
    let totalFetched = 0;

    console.log('Starting paginated data fetch from Supabase...');

    while (hasMore) {
        const rangeEnd = rangeStart + rangeSize - 1;

        // Add Range header for pagination
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Range': `${rangeStart}-${rangeEnd}`,
                'Prefer': 'count=exact' // This will give us the total count
            }
        });

        if (!response.ok) {
            // Check if it's a 416 Range Not Satisfiable (means we've fetched all data)
            if (response.status === 416) {
                console.log('All data fetched (reached end of table)');
                break;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Get total count from content-range header
        const contentRange = response.headers.get('content-range');
        if (contentRange) {
            const match = contentRange.match(/\d+-\d+\/(\d+|\*)/);
            if (match && match[1] !== '*') {
                const totalCount = parseInt(match[1]);
                console.log(`Fetching records: ${rangeStart + 1}-${Math.min(rangeEnd + 1, totalCount)} of ${totalCount} total`);

                // Update loading popup with progress
                if (typeof updateLoadingPopup === 'function') {
                    const percentage = Math.round(((rangeStart + data.length) / totalCount) * 100);
                    updateLoadingPopup(`Veriler Alınıyor... %${percentage} (${rangeStart + data.length}/${totalCount})`);
                }
            }
        }

        if (data && data.length > 0) {
            allData = [...allData, ...data];
            totalFetched += data.length;
            console.log(`Fetched ${data.length} records in this batch, total so far: ${totalFetched}`);

            // If we got fewer records than requested, we've reached the end
            if (data.length < rangeSize) {
                hasMore = false;
                console.log('Received fewer records than requested, reached end of data');
            } else {
                // Move to next page
                rangeStart += rangeSize;
            }
        } else {
            // No more data
            hasMore = false;
            console.log('No more data to fetch');
        }
    }

    console.log(`Successfully fetched total of ${allData.length} records from Supabase`);
    return allData;
}

async function confirmDataReceipt(recordCount) {
    // This function confirms that data was received successfully
    // You can customize this based on your specific requirements
    // For now, we'll just log it and create a timestamp
    
    const receiptLog = {
        timestamp: new Date().toISOString(),
        records_received: recordCount,
        status: 'success',
        message: 'Data successfully received by admin dashboard'
    };
    
    console.log('Data receipt confirmed:', receiptLog);
    
    // If you want to log this receipt to another table in Supabase, 
    // you can uncomment and modify the following code:
    /*
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/receipt_log`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(receiptLog)
        });
    } catch (error) {
        console.warn('Could not log receipt (this is optional):', error);
    }
    */
    
    return true;
}

async function deleteAllDataFromSupabase() {
    // First, get all record IDs to delete them individually
    // This is safer than trying to delete all at once
    
    const selectResponse = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=id`, {
        method: 'GET',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!selectResponse.ok) {
        throw new Error(`Failed to fetch record IDs: ${selectResponse.status}`);
    }
    
    const records = await selectResponse.json();
    
    if (records.length === 0) {
        console.log('No records to delete');
        return;
    }
    
    // Delete all records using a range delete (more efficient)
    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        // Delete all records (be careful with this!)
        body: JSON.stringify({})
    });
    
    // Alternative: Delete with a condition that matches all records
    // You can also use: ?id=gte.0 in the URL to delete all records where id >= 0
    
    const deleteWithCondition = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=gte.0`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
    });
    
    if (!deleteWithCondition.ok) {
        throw new Error(`Failed to delete records: ${deleteWithCondition.status}`);
    }
    
    console.log(`Successfully deleted ${records.length} records from ${TABLE_NAME} table`);
}

// Function to clear all local user data
function clearAllLocalData() {
    if (confirm('Are you sure you want to delete all local user data? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        users = [];
        filteredUsers = [];
        updateUserTable();
        updateCharts();
        console.log('All local user data cleared');
        alert('Local user data cleared successfully');
    }
}

// Make function available globally for console access
window.clearAllLocalData = clearAllLocalData;

function extractUserIds(data) {
    // Extract unique user_ids from the Supabase data
    console.log('Raw Supabase data for user ID extraction:', data);
    
    // Check what fields are available in the first record
    if (data.length > 0) {
        console.log('Available fields in first record:', Object.keys(data[0]));
        console.log('First record user_id:', data[0].user_id);
    }
    
    const userIds = [...new Set(data.map(record => {
        console.log(`Record ${record.id}: user_id = ${record.user_id}`);
        return record.user_id;
    }).filter(id => id != null))];
    
    console.log('Extracted user IDs:', userIds);
    return userIds;
}

async function fetchUserNames(userIds) {
    // Send user_ids to N8N webhook and get back real names
    try {
        console.log('Sending webhook request to N8N with user IDs:', userIds);
        console.log('Webhook URL:', N8N_WEBHOOK_URL);
        
        const requestPayload = {
            user_ids: userIds,
            source: 'activity_tracker_admin',
            timestamp: new Date().toISOString()
        };
        
        console.log('Request payload:', JSON.stringify(requestPayload, null, 2));
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Webhook error response:', errorText);
            throw new Error(`Webhook request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Webhook response (full):', JSON.stringify(result, null, 2));
        
        // Try different possible response formats
        let userNames = {};
        
        // If the result is wrapped (e.g., {data: [...]} or similar), unwrap it
        let dataArray = result;
        if (result.data && Array.isArray(result.data)) {
            dataArray = result.data;
            console.log('Using data array from response');
        } else if (result.items && Array.isArray(result.items)) {
            dataArray = result.items;
            console.log('Using items array from response');
        } else if (result.result && Array.isArray(result.result)) {
            dataArray = result.result;
            console.log('Using result array from response');
        }
        
        if (result.user_names) {
            userNames = result.user_names;
            console.log('Using user_names from response:', userNames);
        } else if (result.data && result.data.user_names) {
            userNames = result.data.user_names;
            console.log('Using data.user_names from response:', userNames);
        } else if (Array.isArray(dataArray)) {
            // Handle N8N array format with "Employee Name" and "Employee Number"
            dataArray.forEach(item => {
                console.log('Processing array item:', item);
                
                // Handle different possible field names
                const employeeNumber = item["Employee Number"] || item.employee_number || item.Employee_Number;
                const employeeName = item["Employee Name"] || item.employee_name || item.Employee_Name;
                
                if (employeeNumber && employeeName) {
                    userNames[employeeNumber.toString()] = employeeName;
                    console.log(`Mapped: ${employeeNumber} -> ${employeeName}`);
                }
            });
            console.log('Mapped array response to userNames:', userNames);
        } else {
            console.warn('Unexpected webhook response format:', result);
            // Try to use the result directly if it looks like a user mapping
            if (typeof result === 'object' && result !== null) {
                userNames = result;
            }
        }
        
        console.log('Final userNames mapping:', userNames);
        return userNames;
        
    } catch (error) {
        console.error('Error fetching user names from webhook:', error);
        // Return empty object if webhook fails, will use fallback names
        return {};
    }
}

function mergeUserRecords(userRecords, userId, userNames) {
    // Merge multiple activity records for the same user into a single user object
    console.log(`Merging ${userRecords.length} records for user ${userId}`);
    
    let totalActiveTime = 0; // in seconds
    let totalInactiveTime = 0; // in seconds
    let totalTime = 0; // in seconds
    let allApps = {};
    let allWebsites = {};
    let latestActivity = null;
    let batchIds = [];
    let inactivePeriods = [];
    
    userRecords.forEach((record, index) => {
        // Parse batch_data JSON (new schema)
        let batchData = {};
        try {
            batchData = typeof record.batch_data === 'string' ? 
                JSON.parse(record.batch_data) : record.batch_data || {};
        } catch (e) {
            console.warn('Could not parse batch_data:', record.batch_data);
            batchData = {};
        }
        
        // Accumulate time data from the new schema
        totalActiveTime += parseFloat(record.active_time_seconds || 0);
        totalInactiveTime += parseFloat(record.inactive_time_seconds || 0);
        totalTime += parseFloat(record.total_time_seconds || 0);
        
        // Track batch IDs
        if (record.batch_id) {
            // Normalize date string (YYYY-MM-DD) if possible
            const dateStr = (batchData.d || record.date_tracked || record.created_at || '').toString().slice(0, 10);
            // Active seconds for this batch
            const at = parseFloat(record.active_time_seconds || batchData.at || 0) || 0;
            const tt = parseFloat(record.total_time_seconds || batchData.tt || at) || at;
            const it = parseFloat(record.inactive_time_seconds || batchData.it || 0) || 0;
            batchIds.push({
            batch_id: record.batch_id,
            date_tracked: record.date_tracked,
            created_at: record.created_at,
            batch_start_time: record.batch_start_time,
            batch_end_time: record.batch_end_time,
            d: dateStr,
            s: batchData.s,
            e: batchData.e,
            at: at,
            tt: tt,
            it: it,
            // Include full batch data for filtering
            ap: batchData.ap || {},
            ur: batchData.ur || {}
        });
        }
        
        // Find latest activity
        const recordActivity = record.created_at ? new Date(record.created_at) : new Date();
        if (!latestActivity || recordActivity > latestActivity) {
            latestActivity = recordActivity;
        }
        
        // Process apps data (shortened field name 'ap')
        const apps = batchData.ap || batchData.apps || {};
        Object.keys(apps).forEach(appName => {
            // Skip filtered apps like Lockapp
            if (shouldFilterApp(appName)) return;

            const appTime = parseFloat(apps[appName] || 0);
            if (!allApps[appName]) {
                allApps[appName] = {
                    name: appName,
                    usage: 0
                };
            }
            allApps[appName].usage += appTime; // Keep as seconds
        });
        
        // Process URLs data (shortened field name 'ur')
        const urls = batchData.ur || batchData.urls || {};
        Object.keys(urls).forEach(rawUrl => {
            const url = cleanWebsiteName(rawUrl);
            const urlData = urls[rawUrl]; // Use rawUrl to access the data, not the cleaned url
            // The time is stored in 't' field in seconds
            const urlTime = parseFloat(urlData.t || urlData.time || urlData || 0);
            // The title is in 'ti' field, but it's usually just the browser name
            const urlTitle = cleanWebsiteTitle(urlData.ti || urlData.title) || url;
            
            if (!allWebsites[url]) {
                allWebsites[url] = {
                    name: cleanWebsiteName(url),
                    title: urlTitle,
                    usage: 0
                };
            }
            allWebsites[url].usage += urlTime; // Keep as seconds
        });
        
        // Collect inactive periods (shortened field name 'ip')
        const inactive = batchData.ip || batchData.inactive_periods || [];
        if (Array.isArray(inactive)) {
            inactivePeriods = inactivePeriods.concat(inactive);
        }
    });
    
    // Keep time in seconds but calculate hours and minutes for display
    const activeHours = Math.floor(totalActiveTime / 3600);
    const activeMinutes = Math.floor((totalActiveTime % 3600) / 60);
    const activeSeconds = totalActiveTime % 60;
    
    const inactiveHours = Math.floor(totalInactiveTime / 3600);
    const inactiveMinutes = Math.floor((totalInactiveTime % 3600) / 60);
    const inactiveSeconds = totalInactiveTime % 60;
    
    // Get real name from webhook response or use fallback
    let realName = userNames[userId] || `${userId}`;

    // Clean existing names that have "User" prefix
    if (realName.startsWith('User ')) {
        realName = realName.substring(5); // Remove "User " prefix
    }
    
    // Convert apps and websites objects to arrays, sorted by usage
    const appsArray = Object.values(allApps).sort((a, b) => b.usage - a.usage);
    const websitesArray = Object.values(allWebsites).sort((a, b) => b.usage - a.usage);
    
    console.log(`User ${realName}: ${totalActiveTime}s active, ${totalInactiveTime}s inactive, ${appsArray.length} apps, ${websitesArray.length} websites`);
    
    return {
        id: userId.hashCode ? userId.hashCode() : Math.random() * 1000,
        name: realName,
        activeTime: {
            hours: activeHours,
            minutes: activeMinutes,
            seconds: activeSeconds,
            total: totalActiveTime
        },
        inactiveTime: {
            hours: inactiveHours,
            minutes: inactiveMinutes,
            seconds: inactiveSeconds,
            total: totalInactiveTime
        },
        apps: appsArray,
        websites: websitesArray,
        lastActivity: latestActivity || new Date(),
        // Additional merged data from new schema
        userId: userId,
        batchIds: batchIds,
        totalActiveSeconds: totalActiveTime,
        totalInactiveSeconds: totalInactiveTime,
        inactivePeriods: inactivePeriods,
        sessionCount: userRecords.length
    };
}

function processSupabaseData(data, userNames = {}) {
    // Convert Supabase data to your app's user format
    // Updated for new schema: activity_summary table with batch_data JSONB column
    // Fields: id, batch_id, user_id, date_tracked, batch_start_time, batch_end_time, 
    //         total_time_seconds, active_time_seconds, inactive_time_seconds, batch_data, created_at
    // Group records by user_id to merge multiple sessions per user
    
    console.log('Processing Supabase data:', data);
    
    if (data.length === 0) {
        console.log('No data to process');
        return;
    }
    
    try {
        // First, group all records by user_id
        const userGroups = {};
        
        data.forEach((record, index) => {
            const userId = record.user_id || `unknown_${index}`;
            
            if (!userGroups[userId]) {
                userGroups[userId] = [];
            }
            userGroups[userId].push(record);
        });
        
        console.log('Grouped data by user_id:', Object.keys(userGroups));
        
        // Process each user group to merge their activity data
        const processedUsers = Object.keys(userGroups).map(userId => {
            const userRecords = userGroups[userId];
            console.log(`Processing ${userRecords.length} records for user ${userId}`);
            
            // Merge all records for this user
            const mergedUser = mergeUserRecords(userRecords, userId, userNames);
            return mergedUser;
        });
        
        // Update the global users array (seconds-based)
        users = processedUsers;

        // Apply current date filtering
        filterUsersByDateRange();

        // Re-apply current sort after data processing
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect && sortSelect.value) {
            sortUsers(sortSelect.value);
        }

        // Update the interface
        renderDashboard();
        updateUserTable();
        updateCharts();
        
        console.log(`Successfully processed ${processedUsers.length} activity records from Supabase data`);
        
    } catch (error) {
        console.error('Error processing Supabase data:', error);
        throw new Error('Failed to process received data: ' + error.message);
    }
}

function parseTimeData(timeData) {
    // Parse time data from Supabase format to our format
    if (typeof timeData === 'string') {
        // If it's a string like "5h 32m" or "320 minutes"
        const hours = timeData.match(/(\d+)h/) ? parseInt(timeData.match(/(\d+)h/)[1]) : 0;
        const minutes = timeData.match(/(\d+)m/) ? parseInt(timeData.match(/(\d+)m/)[1]) : 0;
        return {
            hours: hours,
            minutes: minutes,
            total: hours * 60 + minutes
        };
    } else if (typeof timeData === 'number') {
        // If it's total minutes
        const hours = Math.floor(timeData / 60);
        const minutes = timeData % 60;
        return {
            hours: hours,
            minutes: minutes,
            total: timeData
        };
    } else if (typeof timeData === 'object' && timeData !== null) {
        // If it's already an object
        return {
            hours: timeData.hours || 0,
            minutes: timeData.minutes || 0,
            total: timeData.total || (timeData.hours || 0) * 60 + (timeData.minutes || 0)
        };
    }
    
    // Default fallback
    return {
        hours: 0,
        minutes: 0,
        total: 0
    };
}

function parseAppsData(appsData) {
    // Parse apps data from Supabase format
    if (typeof appsData === 'string') {
        try {
            return JSON.parse(appsData);
        } catch (e) {
            console.warn('Could not parse apps data:', appsData);
            return [];
        }
    } else if (Array.isArray(appsData)) {
        return appsData;
    }
    
    return [];
}

function parseWebsitesData(websitesData) {
    // Parse websites data from Supabase format
    if (typeof websitesData === 'string') {
        try {
            return JSON.parse(websitesData);
        } catch (e) {
            console.warn('Could not parse websites data:', websitesData);
            return [];
        }
    } else if (Array.isArray(websitesData)) {
        return websitesData;
    }
    
    return [];
}

// Helper function to format seconds into readable time format
function formatTime(seconds) {
    const years = Math.floor(seconds / (86400 * 365)); // 365 days in a year
    const months = Math.floor((seconds % (86400 * 365)) / (86400 * 30)); // 30 days in a month
    const days = Math.floor((seconds % (86400 * 30)) / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (years > 0) {
        return `${years}y ${months}a ${days}g`;
    } else if (months > 0) {
        return `${months}a ${days}g ${hours}s`;
    } else if (days > 0) {
        return `${days}g ${hours}s ${minutes}d`;
    }
    return `${hours}s ${minutes}d ${secs}sn`;
}

// Helper function to format time for chart tooltips
function formatTimeForTooltip(seconds) {
    const years = Math.floor(seconds / (86400 * 365));
    const months = Math.floor((seconds % (86400 * 365)) / (86400 * 30));
    const days = Math.floor((seconds % (86400 * 30)) / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (years > 0) {
        return `${years} yıl ${months} ay ${days} gün`;
    } else if (months > 0) {
        return `${months} ay ${days} gün ${hours} saat`;
    } else if (days > 0) {
        return `${days} gün ${hours} saat ${minutes} dakika`;
    } else if (hours > 0) {
        if (minutes > 0) {
            return `${hours} saat ${minutes} dakika`;
        } else {
            return `${hours} saat`;
        }
    } else if (minutes > 0) {
        return `${minutes} dakika`;
    } else {
        return `${Math.round(seconds)} saniye`;
    }
}

// Custom download alert function
function showCustomDownloadAlert(filename, userCount, appCount, websiteCount, totalRows) {
    // Create custom modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 1.75rem 1.5rem 1.75rem 1.5rem;
        min-width: 400px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        line-height: 1.5;
    `;

    const successText = document.createElement('p');
    successText.textContent = 'Excel dosyası hazırlandı';
    successText.style.cssText = `
        margin: calc(0.25rem + 2px) 0 0 0;
        font-size: 1.1rem;
        color: #333;
        font-weight: normal;
    `;

    const statsContainer = document.createElement('div');
    statsContainer.style.cssText = `
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 12px 16px;
        margin: 8px 0;
        width: 100%;
        box-sizing: border-box;
    `;

    const statsText = document.createElement('p');
    statsText.textContent = `Toplam ${userCount} Kullanıcı, ${appCount} Uygulama, ${websiteCount} Web Sitesi verisi dışa aktarıldı. Toplam ${totalRows} satır.`;
    statsText.style.cssText = `
        margin: 0;
        font-size: 0.95rem;
        color: #666;
        line-height: 1.4;
    `;

    statsContainer.appendChild(statsText);

    const button = document.createElement('button');
    button.textContent = 'Tamam';
    button.style.cssText = `
        background: #5F8FA8;
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s ease;
        margin-top: 0.25rem;
    `;

    button.addEventListener('mouseover', () => {
        button.style.background = '#4a7a94';
        button.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseout', () => {
        button.style.background = '#5F8FA8';
        button.style.transform = 'translateY(0)';
    });

    button.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    modal.appendChild(successText);
    modal.appendChild(statsContainer);
    modal.appendChild(button);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Show full user name popup
function showFullUserName(fullName) {
    // Create custom modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 1.5rem 2rem;
        min-width: 300px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Kullanıcı Adı';
    title.style.cssText = `
        margin: 0;
        font-size: 1.1rem;
        color: #2c3e50;
        font-weight: 600;
    `;

    const nameText = document.createElement('p');
    nameText.textContent = fullName;
    nameText.style.cssText = `
        margin: 0;
        font-size: 1rem;
        color: #333;
        word-break: break-word;
        line-height: 1.4;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 12px 16px;
        width: 100%;
        box-sizing: border-box;
    `;

    const button = document.createElement('button');
    button.textContent = 'Tamam';
    button.style.cssText = `
        background: #5F8FA8;
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s ease;
    `;

    button.addEventListener('mouseover', () => {
        button.style.background = '#4a7a94';
        button.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseout', () => {
        button.style.background = '#5F8FA8';
        button.style.transform = 'translateY(0)';
    });

    button.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });

    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    modal.appendChild(title);
    modal.appendChild(nameText);
    modal.appendChild(button);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// Add CSV export functionality
function exportToCSV() {
    if (!filteredUsers || filteredUsers.length === 0) {
        turkishAlert('Dışa Aktarılacak Veri Bulunamadı. Lütfen Verileri Güncelleyiniz veya Filtreleri Kontrol Ediniz.');
        return;
    }

    const avgHeader = currentPeriod === 'daily' ?
        'Kullanıcı Bugün Aktif Süre (saat:dakika:saniye)' :
        'Kullanıcı Ortalama Günlük Aktif Süre (saat:dakika:saniye)';

    const headers = [
        'Kullanıcı Adı',
        'Tarih Aralığı',
        'Kullanıcı Toplam Aktif Süre (saat:dakika:saniye)',
        avgHeader,
        'Kullanıcı Son Aktivite Tarihi',
        'Kullanıcı Son Aktivite Saati',
        'Uygulama/Web Sitesi Adı',
        'Tür',
        'Uygulama/Web Sitesi Kullanım Süresi (saat:dakika:saniye)',
        'Uygulama/Web Sitesi Kullanım Süresi (dakika)'
    ];

    const csvData = [];

    filteredUsers.forEach(user => {
        // Calculate date range based on current period
        let dateRange = '';
        if (currentPeriod === 'daily') {
            const today = new Date().toLocaleDateString('tr-TR');
            dateRange = today;
        } else if (currentPeriod === 'weekly') {
            const today = new Date();
            const monday = new Date(today);
            monday.setDate(today.getDate() - today.getDay() + 1);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            dateRange = `${monday.toLocaleDateString('tr-TR')} - ${sunday.toLocaleDateString('tr-TR')}`;
        } else if (currentPeriod === 'monthly') {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            dateRange = `${firstDay.toLocaleDateString('tr-TR')} - ${lastDay.toLocaleDateString('tr-TR')}`;
        } else if (currentPeriod === 'annual') {
            const currentYear = new Date().getFullYear();
            dateRange = `01.01.${currentYear} - 31.12.${currentYear}`;
        } else if (currentPeriod === 'custom' && customStartDate && customEndDate) {
            const startFormatted = new Date(customStartDate).toLocaleDateString('tr-TR');
            const endFormatted = new Date(customEndDate).toLocaleDateString('tr-TR');
            dateRange = `${startFormatted} - ${endFormatted}`;
        } else {
            dateRange = 'Belirsiz';
        }

        // Format total active time
        const totalTimeFormatted = formatTime(user.activeTime.total);

        // Calculate average daily active time
        const avgDailySeconds = user.activeTime.total / 7; // Assuming weekly data
        const avgDailyFormatted = formatTime(Math.round(avgDailySeconds));

        // Format last activity date and time
        const lastActivityDate = new Date(user.lastActivity);
        const dateFormatted = lastActivityDate.toLocaleDateString('tr-TR');
        const timeFormatted = lastActivityDate.toLocaleTimeString('tr-TR');

        // Base user info
        const baseUserInfo = [
            user.name,
            dateRange,
            totalTimeFormatted,
            avgDailyFormatted,
            dateFormatted,
            timeFormatted
        ];

        // Add row for each app (excluding filtered apps like Lockapp)
        if (user.apps && user.apps.length > 0) {
            user.apps.forEach(app => {
                // Skip filtered apps like Lockapp
                if (shouldFilterApp(app.name)) return;

                const usageInMinutes = Math.round(app.usage / 60); // Convert seconds to minutes
                const usageFormatted = formatTime(app.usage);

                csvData.push([
                    ...baseUserInfo,
                    formatAppName(app.name),
                    'Uygulama',
                    usageFormatted,
                    usageInMinutes
                ]);
            });
        }

        // Add row for each website
        if (user.websites && user.websites.length > 0) {
            user.websites.forEach(site => {
                const usageInMinutes = Math.round(site.usage / 60); // Convert seconds to minutes
                const usageFormatted = formatTime(site.usage);

                csvData.push([
                    ...baseUserInfo,
                    cleanWebsiteName(site.name) || site.name,
                    'Web Sitesi',
                    usageFormatted,
                    usageInMinutes
                ]);
            });
        }

        // If user has no apps or websites, add a single row with empty usage data
        if ((!user.apps || user.apps.length === 0) && (!user.websites || user.websites.length === 0)) {
            csvData.push([
                ...baseUserInfo,
                'Veri yok',
                'N/A',
                '0s 0d 0sn',
                0
            ]);
        }
    });

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers, ...csvData]
        .map(row => row.map(field => {
            // Escape double quotes and wrap fields containing semicolons, quotes, or newlines
            const stringField = String(field);
            if (stringField.includes(';') || stringField.includes('"') || stringField.includes('\n') || stringField.includes(',')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        }).join(';'))
        .join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    // Generate filename with current date and filter info
    const today = new Date().toISOString().split('T')[0];
    const currentFilter = document.getElementById('sort-select').value;
    const searchTerm = document.getElementById('search-input').value.trim();

    let filename = `ActivityX_Rapor_${today}`;

    // Add time period information
    const periodNames = {
        'daily': 'Gunluk',
        'weekly': 'Haftalik',
        'monthly': 'Aylik',
        'annual': 'Yillik',
        'custom': 'Ozel'
    };

    if (currentPeriod && periodNames[currentPeriod]) {
        filename += `_${periodNames[currentPeriod]}`;
    }

    // Add sorting information
    const sortOptions = {
        'name-az': 'Isim_A_Z',
        'name-za': 'Isim_Z_A',
        'active-time-desc': 'En_Yuksek_Aktivite',
        'active-time-asc': 'En_Dusuk_Aktivite',
        'recent': 'En_Yeni_Aktivite',
        'oldest': 'En_Eski_Aktivite'
    };

    if (currentFilter && sortOptions[currentFilter]) {
        filename += `_${sortOptions[currentFilter]}`;
    }

    // Add search term information
    if (searchTerm) {
        const cleanSearchTerm = searchTerm.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '_');
        // Convert to title case
        const titleCaseSearchTerm = cleanSearchTerm.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join('_');
        filename += `_Arama_${titleCaseSearchTerm}`;
    }

    // Add user count information
    filename += `_${filteredUsers.length}_Kullanici`;

    filename += `.csv`;

    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Calculate total rows
    const totalRows = csvData.length;
    const totalApps = csvData.filter(row => row[7] === 'Uygulama').length;
    const totalWebsites = csvData.filter(row => row[7] === 'Web Sitesi').length;

    // Show success message with custom formatted modal after a delay
    setTimeout(() => {
        showCustomDownloadAlert(filename, filteredUsers.length, totalApps, totalWebsites, totalRows);
    }, 2000);
}

// Export CSV for specific user from modal
function exportUserCSV() {
    if (!currentModalUser) {
        turkishAlert('Kullanıcı Verisi Bulunamadı. Lütfen Modal Sayfasını Yeniden Açınız.');
        return;
    }

    const user = currentModalUser;

    const headers = [
        'Kullanıcı Adı',
        'Tarih Aralığı',
        'Uygulama/Web Sitesi Adı',
        'Tür',
        'Uygulama/Web Sitesi Kullanım Süresi (saat:dakika:saniye)',
        'Uygulama/Web Sitesi Kullanım Süresi (dakika)'
    ];

    const csvData = [];

    // Calculate date range based on current period
    let dateRange = '';
    if (currentPeriod === 'daily') {
        const today = new Date().toLocaleDateString('tr-TR');
        dateRange = today;
    } else if (currentPeriod === 'weekly') {
        const today = new Date();
        const monday = new Date(today);
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        monday.setDate(today.getDate() - mondayOffset);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        dateRange = `${monday.toLocaleDateString('tr-TR')} - ${sunday.toLocaleDateString('tr-TR')}`;
    } else if (currentPeriod === 'monthly') {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        dateRange = `${firstDay.toLocaleDateString('tr-TR')} - ${lastDay.toLocaleDateString('tr-TR')}`;
    } else if (currentPeriod === 'annual') {
        const currentYear = new Date().getFullYear();
        dateRange = `01.01.${currentYear} - 31.12.${currentYear}`;
    } else if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        const startFormatted = new Date(customStartDate).toLocaleDateString('tr-TR');
        const endFormatted = new Date(customEndDate).toLocaleDateString('tr-TR');
        dateRange = `${startFormatted} - ${endFormatted}`;
    } else {
        dateRange = 'Belirsiz';
    }

    // Base user info (only name and date range)
    const baseUserInfo = [
        user.name,
        dateRange
    ];

    // Add row for each app (excluding filtered apps like Lockapp)
    if (user.apps && user.apps.length > 0) {
        user.apps.forEach(app => {
            // Skip filtered apps like Lockapp
            if (shouldFilterApp(app.name)) return;

            const usageInMinutes = Math.round(app.usage / 60);
            const usageFormatted = formatTime(app.usage);

            csvData.push([
                ...baseUserInfo,
                formatAppName(app.name),
                'Uygulama',
                usageFormatted,
                usageInMinutes
            ]);
        });
    }

    // Add row for each website
    if (user.websites && user.websites.length > 0) {
        user.websites.forEach(site => {
            const usageInMinutes = Math.round(site.usage / 60);
            const usageFormatted = formatTime(site.usage);

            csvData.push([
                ...baseUserInfo,
                cleanWebsiteName(site.name) || site.name,
                'Web Sitesi',
                usageFormatted,
                usageInMinutes
            ]);
        });
    }

    // If user has no apps or websites, add a single row with empty usage data
    if ((!user.apps || user.apps.length === 0) && (!user.websites || user.websites.length === 0)) {
        csvData.push([
            ...baseUserInfo,
            'Veri yok',
            'N/A',
            '0s 0d 0sn',
            0
        ]);
    }

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers, ...csvData]
        .map(row => row.map(field => {
            const stringField = String(field);
            if (stringField.includes(';') || stringField.includes('"') || stringField.includes('\n') || stringField.includes(',')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        }).join(';'))
        .join('\n');

    // Generate filename with user name and date range
    // Clean username for filename
    const cleanUserName = user.name.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '_');

    // Clean date range for filename (replace dots and spaces with underscores, keep single dash)
    const cleanDateRange = dateRange.replace(/\./g, '_').replace(/\s+/g, '_');

    const filename = `${cleanUserName}_Rapor_${cleanDateRange}.csv`;

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Calculate total rows
    const totalRows = csvData.length;
    const totalApps = csvData.filter(row => row[3] === 'Uygulama').length;
    const totalWebsites = csvData.filter(row => row[3] === 'Web Sitesi').length;

    // Show success message with custom formatted modal after a delay
    setTimeout(() => {
        showCustomDownloadAlert(filename, 1, totalApps, totalWebsites, totalRows);
    }, 2000);
}

// Header functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize header with user information
    initializeHeader();

    // Setup dropdown menu functionality
    setupUserDropdown();
});

// Get user session and populate header
async function initializeHeader() {
    try {
        // First try to get fresh user data from Supabase
        const currentUserData = await window.electronAPI?.getCurrentUser?.();

        let sessionData = currentUserData;

        // If that fails, fall back to cached session
        if (!sessionData) {
            sessionData = await window.electronAPI?.getUserSession?.();
        }

        if (sessionData && sessionData.user) {
            const userName = sessionData.user.profile?.first_name && sessionData.user.profile?.last_name
                ? `${sessionData.user.profile.first_name} ${sessionData.user.profile.last_name}`
                : sessionData.user.email || 'Kullanıcı';

            const lawFirmName = sessionData.user.profile?.law_firm_name || 'Hukuk Bürosu';

            // Update header elements
            const userNameEl = document.getElementById('header-user-name');
            const lawFirmEl = document.getElementById('header-law-firm');

            if (userNameEl) userNameEl.textContent = userName;
            if (lawFirmEl) lawFirmEl.textContent = lawFirmName;

            console.log('Header updated with user data:', { userName, lawFirmName });
        } else {
            throw new Error('No user data available');
        }
    } catch (error) {
        console.error('Error loading user session:', error);
        // Fallback values
        const userNameEl = document.getElementById('header-user-name');
        const lawFirmEl = document.getElementById('header-law-firm');

        if (userNameEl) userNameEl.textContent = 'Kullanıcı';
        if (lawFirmEl) lawFirmEl.textContent = 'Hukuk Bürosu';
    }
}

// Setup dropdown menu functionality
function setupUserDropdown() {
    const menuButton = document.getElementById('profile-menu-btn');
    const dropdown = document.getElementById('user-dropdown');

    if (!menuButton || !dropdown) return;

    // Toggle dropdown on button click
    menuButton.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!menuButton.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdown.classList.remove('show');
        }
    });
}

// ============================================
// Timeline Visualization Functions
// ============================================

/**
 * Render minute-by-minute activity timeline for a single day
 * Only called when numberOfDays === 1
 */
function renderActivityTimeline(user) {
    console.log('Rendering activity timeline for user:', user.name);

    // Get the target date based on current period
    const targetDate = getTargetDateForTimeline();
    console.log('Target date for timeline:', targetDate);

    // Generate timeline data (1440 minutes in a day)
    const timelineData = generateTimelineData(user, targetDate);
    console.log('Timeline data generated:', timelineData.length, 'minutes');

    // Render the timeline on canvas
    drawTimelineCanvas(timelineData);

    // Setup hover interaction
    setupTimelineHover(timelineData);
}

/**
 * Get the target date for timeline based on current period
 * Returns date string in YYYY-MM-DD format
 */
function getTargetDateForTimeline() {
    const today = new Date();

    if (currentPeriod === 'daily') {
        // Today
        return formatDateString(today);
    } else if (currentPeriod === 'custom' && customStartDate) {
        // Custom date (should be single day)
        return formatDateString(customStartDate);
    }

    // Fallback to today
    return formatDateString(today);
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generate minute-by-minute timeline data for a specific date
 * Returns array of 1440 minute objects (24 hours * 60 minutes)
 */
function generateTimelineData(user, targetDate) {
    // Initialize 1440 minutes with 'offline' state
    const timeline = Array(1440).fill(null).map(() => ({
        state: 'offline', // 'active', 'inactive', 'offline'
        startTime: null,
        endTime: null
    }));

    // Get batches for target date
    const dayBatches = (user.batchIds || []).filter(batch => {
        const batchDate = batch.d || '';
        const batchEndDate = batch.ed || '';
        return batchDate === targetDate || batchEndDate === targetDate;
    });

    console.log('Found', dayBatches.length, 'batches for date:', targetDate);

    // Process each batch
    dayBatches.forEach((batch, batchIndex) => {
        console.log(`Processing batch ${batchIndex}:`, batch);

        // Parse start and end times
        const startTime = parseTimeToMinutes(batch.s || batch.batch_start_time);
        const endTime = parseTimeToMinutes(batch.e || batch.batch_end_time);

        if (startTime === null || endTime === null) {
            console.warn('Could not parse times for batch:', batch);
            return;
        }

        console.log(`Batch time range: ${startTime} - ${endTime} minutes (${formatMinutesToTime(startTime)} - ${formatMinutesToTime(endTime)})`);

        // Calculate active/inactive ratio excluding LockApp
        let adjustedActiveTime = batch.at || 0;
        let adjustedInactiveTime = batch.it || 0;

        // Check if batch has app data and LockApp usage
        const appsData = batch.ap || batch.batch_data?.ap || {};
        if (appsData && typeof appsData === 'object') {
            const lockAppTime = appsData['LockApp'] || appsData['lockapp'] || appsData['Lockapp'] || 0;
            if (lockAppTime > 0) {
                // Subtract LockApp time from active time and add to inactive time
                adjustedActiveTime = Math.max(0, adjustedActiveTime - lockAppTime);
                adjustedInactiveTime += lockAppTime;
                console.log(`Excluding LockApp time: ${lockAppTime}s from batch ${batchIndex}`);
            }
        }

        const totalSeconds = adjustedActiveTime + adjustedInactiveTime;
        const activeRatio = totalSeconds > 0 ? adjustedActiveTime / totalSeconds : 0;

        console.log(`Active ratio: ${(activeRatio * 100).toFixed(1)}% (adjusted for LockApp)`);

        // Fill timeline minutes
        const batchDuration = endTime - startTime;
        for (let minute = startTime; minute < endTime && minute < 1440; minute++) {
            // Determine state based on active ratio
            // Simple approach: distribute active/inactive proportionally
            const minuteProgress = (minute - startTime) / batchDuration;
            const state = minuteProgress < activeRatio ? 'active' : 'inactive';

            timeline[minute] = {
                state: state,
                startTime: startTime,
                endTime: endTime,
                batch: batch
            };
        }
    });

    return timeline;
}

/**
 * Parse time string to minutes since midnight
 * Accepts formats: "HH:MM:SS", "HH:MM", ISO timestamp
 */
function parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;

    try {
        // If it's an ISO timestamp (contains 'T'), extract time part
        if (typeof timeStr === 'string' && timeStr.includes('T')) {
            const timePart = timeStr.split('T')[1];
            if (timePart) {
                timeStr = timePart.split('Z')[0]; // Remove Z if present
            }
        }

        // Parse HH:MM:SS or HH:MM
        const parts = String(timeStr).split(':');
        if (parts.length >= 2) {
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);

            if (!isNaN(hours) && !isNaN(minutes)) {
                return hours * 60 + minutes;
            }
        }
    } catch (e) {
        console.warn('Error parsing time:', timeStr, e);
    }

    return null;
}

/**
 * Format minutes since midnight to HH:MM string
 */
function formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Draw timeline on canvas
 */
function drawTimelineCanvas(timelineData) {
    const canvas = document.getElementById('timeline-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Colors - active is blue, inactive and offline are light gray (matching UI boxes)
    const colors = {
        active: '#4A7B93',
        inactive: '#f8f9fa',
        offline: '#f8f9fa'
    };

    // Draw each minute as a vertical line
    const pixelsPerMinute = width / 1440;

    timelineData.forEach((minute, index) => {
        const x = index * pixelsPerMinute;
        const color = colors[minute.state] || colors.offline;

        ctx.fillStyle = color;
        ctx.fillRect(x, 0, Math.ceil(pixelsPerMinute), height);
    });

    // Draw hour separators (dark gray lines at 3, 6, 9, 12, 15, 18, 21)
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    const hoursToMark = [3, 6, 9, 12, 15, 18, 21];
    hoursToMark.forEach(hour => {
        const x = (hour * 60) * pixelsPerMinute;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    });
}

/**
 * Update timeline stats display
 */
function updateTimelineStats(timelineData) {
    let activeMinutes = 0;
    let inactiveMinutes = 0;

    timelineData.forEach(minute => {
        if (minute.state === 'active') activeMinutes++;
        else if (minute.state === 'inactive') inactiveMinutes++;
    });

    // Convert to hours and minutes
    const activeHours = Math.floor(activeMinutes / 60);
    const activeMins = activeMinutes % 60;
    const inactiveHours = Math.floor(inactiveMinutes / 60);
    const inactiveMins = inactiveMinutes % 60;

    document.getElementById('timeline-active-display').textContent =
        `${activeHours}s ${activeMins}d`;
    document.getElementById('timeline-inactive-display').textContent =
        `${inactiveHours}s ${inactiveMins}d`;
}

/**
 * Setup hover interaction for timeline
 */
function setupTimelineHover(timelineData) {
    const canvas = document.getElementById('timeline-canvas');
    const tooltip = document.getElementById('timeline-tooltip');

    if (!canvas || !tooltip) return;

    // Mouse move handler
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const canvasWidth = canvas.width;

        // Calculate which minute we're hovering over
        const minute = Math.floor((x / rect.width) * 1440);

        if (minute >= 0 && minute < 1440) {
            const data = timelineData[minute];

            // Show tooltip
            tooltip.style.display = 'block';
            tooltip.style.left = e.clientX + 10 + 'px';
            tooltip.style.top = e.clientY + 10 + 'px';

            // Update tooltip content
            const timeStr = formatMinutesToTime(minute);
            document.getElementById('tooltip-time-range').textContent = timeStr;

            let stateText = 'İnaktif';
            if (data.state === 'active') stateText = 'Aktif';

            document.getElementById('tooltip-state').textContent = `Durum: ${stateText}`;

            // Don't show batch duration - remove it for all states
            document.getElementById('tooltip-duration').textContent = '';
        }
    });

    // Mouse leave handler
    canvas.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
} 