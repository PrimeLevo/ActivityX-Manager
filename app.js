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

// Turkish Calendar Implementation
class TurkishCalendar {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        this.options = {
            onSelect: options.onSelect || (() => {}),
            minDate: options.minDate || null,
            maxDate: options.maxDate || null,
            selectedDate: options.selectedDate || null,
            rangeStart: options.rangeStart || null,
            rangeEnd: options.rangeEnd || null,
            type: options.type || 'single' // 'single', 'range-start', 'range-end'
        };

        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.selectedDate = this.options.selectedDate;

        this.turkishMonths = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];

        this.turkishDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

        this.render();
    }

    render() {
        const today = new Date();
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);

        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        let firstDayOfWeek = firstDay.getDay();
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        let html = `
            <div class="calendar-header">
                <button type="button" class="prev-month" data-action="prev">‹</button>
                <div class="calendar-month-year">${this.turkishMonths[this.currentMonth]} ${this.currentYear}</div>
                <button type="button" class="next-month" data-action="next">›</button>
            </div>
            <div class="calendar-weekdays">
                ${this.turkishDays.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
            </div>
            <div class="calendar-days">
        `;

        // Previous month's days
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevLastDay.getDate() - i;
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        // Current month's days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dateStr = this.formatDate(date);
            let classes = ['calendar-day'];
            let disabled = false;

            // Check if today
            if (this.isSameDay(date, today)) {
                classes.push('today');
            }

            // Check if selected
            if (this.selectedDate && this.isSameDay(date, this.selectedDate)) {
                classes.push('selected');
            }

            // Check if in range
            if (this.options.rangeStart && this.options.rangeEnd) {
                if (this.options.type === 'range-start' && this.isSameDay(date, this.options.rangeStart)) {
                    classes.push('range-start');
                } else if (this.options.type === 'range-end' && this.isSameDay(date, this.options.rangeEnd)) {
                    classes.push('range-end');
                } else if (date > this.options.rangeStart && date < this.options.rangeEnd) {
                    classes.push('in-range');
                }
            }

            // Check min/max dates
            if (this.options.minDate && date < this.options.minDate) {
                classes.push('disabled');
                disabled = true;
            }
            if (this.options.maxDate && date > this.options.maxDate) {
                classes.push('disabled');
                disabled = true;
            }

            html += `<div class="${classes.join(' ')}" data-date="${dateStr}" ${disabled ? 'data-disabled="true"' : ''}>${day}</div>`;
        }

        // Next month's days to fill the grid
        const totalCells = firstDayOfWeek + lastDay.getDate();
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        html += '</div>';

        this.element.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.element.querySelector('.prev-month').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.previousMonth();
        });

        this.element.querySelector('.next-month').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.nextMonth();
        });

        this.element.querySelectorAll('.calendar-day:not(.other-month):not(.disabled)').forEach(day => {
            day.addEventListener('click', (e) => {
                e.stopPropagation();
                const dateStr = day.dataset.date;
                if (dateStr && !day.dataset.disabled) {
                    this.selectDate(dateStr);
                }
            });
        });
    }

    previousMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }
        this.render();
    }

    nextMonth() {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }
        this.render();
    }

    selectDate(dateStr) {
        this.selectedDate = new Date(dateStr);
        this.options.onSelect(this.selectedDate);
        this.render();
    }

    setSelectedDate(date) {
        this.selectedDate = date;
        if (date) {
            this.currentMonth = date.getMonth();
            this.currentYear = date.getFullYear();
        }
        this.render();
    }

    setRangeStart(date) {
        this.options.rangeStart = date;
        this.render();
    }

    setRangeEnd(date) {
        this.options.rangeEnd = date;
        this.render();
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateTurkish(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
}

// Global variables
let users = [];
// Infinite scroll - no pagination needed
let filteredUsers = [];
let currentPeriod = 'weekly';
let customStartDate = null;
let customEndDate = null;
let currentTeamFilter = ''; // Track selected team for filtering
let activityChart, appsChart, websitesChart, topUsersChart, dailyTrendChart, modalAppsChart, modalWebsitesChart;

// Local persistence for cumulative data
const STORAGE_KEY = 'kta_persisted_users_v1';
window.STORAGE_KEY = STORAGE_KEY; // Make it globally accessible

function loadPersistedUsers() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return [];
        }

        const cleanedUsers = parsed.map(u => {
            // Clean website titles in persisted data
            const cleanedUser = {
                ...u,
                lastActivity: u.lastActivity ? new Date(u.lastActivity) : new Date()
            };

            if (cleanedUser.websites && Array.isArray(cleanedUser.websites)) {
                cleanedUser.websites = cleanedUser.websites.map(website => ({
                    ...website,
                    name: cleanWebsiteName(website.name) || website.name,
                    url: cleanWebsiteName(website.url) || website.url
                }));
            }

            return cleanedUser;
        });

        return cleanedUsers;
    } catch (e) {
        console.error('[Storage] Failed to load data:', e.message);
        return [];
    }
}

function savePersistedUsers(persistedUsers) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedUsers));
    } catch (e) {
        // Silently fail if localStorage is not available
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
            const incomingTime = new Date(inU.lastActivity).getTime();
            const currentTime = cur.lastActivity ? new Date(cur.lastActivity).getTime() : 0;
            const maxTime = Math.max(currentTime, incomingTime);
            const oldActivity = cur.lastActivity;
            cur.lastActivity = new Date(maxTime);

            // Only log if the activity was actually updated to a newer time
            if (maxTime > currentTime) {
            }
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

// Setup dashboard page functionality
function setupDashboardPage() {
    // Note: Dashboard page keeps its own filters (team filter, search)
    // They are intentionally preserved when navigating back to dashboard

    // Reload data from localStorage to ensure we have the latest data
    const persisted = loadPersistedUsers();

    if (persisted && persisted.length > 0) {
        users = persisted.map(user => {
            if (user.batchIds && user.batchIds.length > 0) {
                user.websites = processUserWebsites(user);
            }
            return user;
        });
        filteredUsers = [...users];
        filterUsersByDateRange();
        updateCharts(); // Render charts with loaded data
    } else {
        users = [];
        filteredUsers = [];
        // Still call updateCharts to show empty state
        updateCharts();
    }

    // Setup time period selector for dashboard
    const periodButtons = document.querySelectorAll('.dashboard-controls [data-period]');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const customDateSelector = document.getElementById('dashboard-custom-date-selector');

            if (this.dataset.period === 'custom') {
                // Toggle custom popup
                const isVisible = customDateSelector && customDateSelector.style.display === 'block';
                if (isVisible) {
                    hideDashboardCustomDatePopup();
                } else {
                    showDashboardCustomDatePopup();
                }
            } else {
                // Hide custom popup if visible
                if (customDateSelector) {
                    customDateSelector.style.display = 'none';
                }

                // Update active button
                periodButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Set the global period and filter
                currentPeriod = this.dataset.period;
                customStartDate = null;
                customEndDate = null;
                filterUsersByDateRange();
                updateCharts();
            }
        });
    });

    // Setup refresh button
    const refreshBtn = document.getElementById('dashboard-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const refreshModal = document.getElementById('refresh-modal');
            if (refreshModal) {
                refreshModal.style.display = 'flex';
            }
        });
    }

    // Setup refresh modal buttons
    const refreshConfirmBtn = document.getElementById('refresh-confirm');
    const refreshCancelBtn = document.getElementById('refresh-cancel');
    const refreshModal = document.getElementById('refresh-modal');

    if (refreshConfirmBtn) {
        refreshConfirmBtn.addEventListener('click', () => {
            if (refreshModal) {
                refreshModal.style.display = 'none';
            }
            showLoadingPopup('Veriler güncelleniyor...');
            loadAllUserData();
        });
    }

    if (refreshCancelBtn) {
        refreshCancelBtn.addEventListener('click', () => {
            if (refreshModal) {
                refreshModal.style.display = 'none';
            }
        });
    }

    // Close refresh modal when clicking outside
    if (refreshModal) {
        refreshModal.addEventListener('click', (e) => {
            if (e.target === refreshModal) {
                refreshModal.style.display = 'none';
            }
        });
    }

    // Setup custom date range buttons
    const applyBtn = document.getElementById('dashboard-apply-date-range');
    const cancelBtn = document.getElementById('dashboard-cancel-date-range');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            applyDashboardDateRange();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            hideDashboardCustomDatePopup();
        });
    }

    // Initialize calendars for dashboard
    initializeDashboardCalendars();
}

function showDashboardCustomDatePopup() {
    const popup = document.getElementById('dashboard-custom-date-selector');
    if (popup) {
        popup.style.display = 'block';
    }
}

function hideDashboardCustomDatePopup() {
    const popup = document.getElementById('dashboard-custom-date-selector');
    if (popup) {
        popup.style.display = 'none';
    }
}

function applyDashboardDateRange() {
    if (!selectedStartDate || !selectedEndDate) {
        alert('Lütfen başlangıç ve bitiş tarihlerini seçin');
        return;
    }

    // Update active button
    const periodButtons = document.querySelectorAll('.dashboard-controls [data-period]');
    periodButtons.forEach(b => b.classList.remove('active'));
    document.getElementById('dashboard-custom-btn').classList.add('active');

    // Apply filter using the correct global variables
    currentPeriod = 'custom';
    customStartDate = selectedStartDate;
    customEndDate = selectedEndDate;
    filterUsersByDateRange();
    updateCharts();
    hideDashboardCustomDatePopup();
}

// Local variables for dashboard calendar
let selectedStartDate = null;
let selectedEndDate = null;
let dashboardStartCalendar = null;
let dashboardEndCalendar = null;

function initializeDashboardCalendars() {
    const today = new Date();
    const oneYearAgo = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000));

    // Initialize start date calendar
    dashboardStartCalendar = new TurkishCalendar('dashboard-start-calendar', {
        type: 'range-start',
        minDate: oneYearAgo,
        maxDate: today,
        rangeStart: customStartDate,
        rangeEnd: customEndDate,
        onSelect: (date) => {
            selectedStartDate = date;
            const displayElement = document.getElementById('dashboard-start-date-display');
            const dateText = displayElement.querySelector('.date-text');
            dateText.textContent = dashboardStartCalendar.formatDateTurkish(date);

            // Update both calendars to show range
            if (selectedEndDate && date > selectedEndDate) {
                selectedEndDate = date;
                const endDisplayElement = document.getElementById('dashboard-end-date-display');
                const endDateText = endDisplayElement.querySelector('.date-text');
                endDateText.textContent = dashboardEndCalendar.formatDateTurkish(date);
            }

            if (dashboardEndCalendar) {
                dashboardEndCalendar.setRangeStart(date);
                dashboardEndCalendar.setRangeEnd(selectedEndDate);
            }
            dashboardStartCalendar.setRangeStart(date);
            dashboardStartCalendar.setRangeEnd(selectedEndDate);

            // Close calendar
            document.getElementById('dashboard-start-calendar-wrapper').style.display = 'none';
        }
    });

    // Initialize end date calendar
    dashboardEndCalendar = new TurkishCalendar('dashboard-end-calendar', {
        type: 'range-end',
        minDate: oneYearAgo,
        maxDate: today,
        rangeStart: customStartDate,
        rangeEnd: customEndDate,
        onSelect: (date) => {
            selectedEndDate = date;
            const displayElement = document.getElementById('dashboard-end-date-display');
            const dateText = displayElement.querySelector('.date-text');
            dateText.textContent = dashboardEndCalendar.formatDateTurkish(date);

            // Update both calendars to show range
            if (selectedStartDate && date < selectedStartDate) {
                selectedStartDate = date;
                const startDisplayElement = document.getElementById('dashboard-start-date-display');
                const startDateText = startDisplayElement.querySelector('.date-text');
                startDateText.textContent = dashboardStartCalendar.formatDateTurkish(date);
            }

            if (dashboardStartCalendar) {
                dashboardStartCalendar.setRangeStart(selectedStartDate);
                dashboardStartCalendar.setRangeEnd(date);
            }
            dashboardEndCalendar.setRangeStart(selectedStartDate);
            dashboardEndCalendar.setRangeEnd(date);

            // Close calendar
            document.getElementById('dashboard-end-calendar-wrapper').style.display = 'none';
        }
    });

    // Setup click handlers for date displays
    const startDateDisplay = document.getElementById('dashboard-start-date-display');
    const endDateDisplay = document.getElementById('dashboard-end-date-display');

    if (startDateDisplay) {
        startDateDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            const wrapper = document.getElementById('dashboard-start-calendar-wrapper');
            const endWrapper = document.getElementById('dashboard-end-calendar-wrapper');
            if (wrapper.style.display === 'block') {
                wrapper.style.display = 'none';
            } else {
                wrapper.style.display = 'block';
                if (endWrapper) endWrapper.style.display = 'none';
            }
        });
    }

    if (endDateDisplay) {
        endDateDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            const wrapper = document.getElementById('dashboard-end-calendar-wrapper');
            const startWrapper = document.getElementById('dashboard-start-calendar-wrapper');
            if (wrapper.style.display === 'block') {
                wrapper.style.display = 'none';
            } else {
                wrapper.style.display = 'block';
                if (startWrapper) startWrapper.style.display = 'none';
            }
        });
    }

    // Close calendars when clicking outside
    document.addEventListener('click', (e) => {
        const startWrapper = document.getElementById('dashboard-start-calendar-wrapper');
        const endWrapper = document.getElementById('dashboard-end-calendar-wrapper');
        const startDateDisplay = document.getElementById('dashboard-start-date-display');
        const endDateDisplay = document.getElementById('dashboard-end-date-display');

        if (startWrapper && startDateDisplay && !startDateDisplay.contains(e.target) && !startWrapper.contains(e.target)) {
            startWrapper.style.display = 'none';
        }
        if (endWrapper && endDateDisplay && !endDateDisplay.contains(e.target) && !endWrapper.contains(e.target)) {
            endWrapper.style.display = 'none';
        }
    });
}

// Router initialization function
function initializeRouter() {
    // Register routes
    router.addRoute('dashboard', {
        template: 'pages/dashboard.html',
        onLoad: () => {
            setupDashboardPage();
            createCharts();
            updateCharts();
        }
    });

    router.addRoute('reports', {
        template: 'pages/reports.html',
        onLoad: () => {
            setupReportsPage();
        }
    });

    router.addRoute('table', {
        template: 'pages/table.html',
        onLoad: () => {
            setupTablePage();
            // Apply default A-Z sorting
            sortUsers('name-az');
            updateUserTable();
        }
    });

    router.addRoute('calisanlar', {
        template: 'pages/calisanlar.html',
        onLoad: () => {
            setupCalisanlarPage();
        }
    });

    router.addRoute('ekipler', {
        template: 'pages/ekipler.html',
        onLoad: () => {
            setupEkiplerPage();
        }
    });

    router.addRoute('profile', {
        template: 'pages/profile.html',
        onLoad: () => {
            // Initialize ProfilePage after DOM is ready
            if (window.ProfilePage) {
                new window.ProfilePage();
            } else {
                console.error('[APP] ProfilePage class not found!');
            }
        }
    });

    // Initialize the router
    router.init();
}

// Sidebar toggle function
function initializeSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
    const profileBtn = document.getElementById('profile-btn');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');

            // Save state to localStorage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
    }

    // Sidebar logout button - DISABLED: Now handled by logout-modal.js
    // if (sidebarLogoutBtn) {
    //     sidebarLogoutBtn.addEventListener('click', () => {
    //         const logoutModal = document.getElementById('logout-modal');
    //         if (logoutModal) {
    //             logoutModal.style.display = 'flex';
    //         }
    //     });
    // }

    // Profile button - navigate to profile page
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            router.navigate('profile');
        });
    }

    // Handle responsive table controls when sidebar state changes
    const handleSidebarResize = () => {
        const timePeriodSelector = document.querySelector('.time-period-selector');
        const tableControls = document.querySelector('.table-controls');

        if (timePeriodSelector && tableControls) {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                const availableWidth = mainContent.offsetWidth;
                // Add compact mode if width is less than 1200px when sidebar is expanded
                if (!sidebar.classList.contains('collapsed') && availableWidth < 1200) {
                    timePeriodSelector.classList.add('compact-mode');
                } else {
                    timePeriodSelector.classList.remove('compact-mode');
                }
            }
        }
    };

    // Observer for sidebar state changes
    const sidebarObserver = new MutationObserver(handleSidebarResize);
    sidebarObserver.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Initial check
    handleSidebarResize();

    // Also handle window resize
    window.addEventListener('resize', handleSidebarResize);

    // Restore saved state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
    }
}

// Setup reports page functionality
function setupReportsPage() {
    // Initialize the new reports page functionality
    if (window.initReportsPage) {
        window.initReportsPage();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Test Turkish normalization
    testTurkishNormalization();

    // Load data from localStorage
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

    // Setup event listeners for buttons and controls
    setupEventListeners();

    // Render dashboard header (user name, law firm name) - this is global across all pages
    renderDashboard();

    // Initialize Sidebar Toggle
    initializeSidebarToggle();

    // Initialize Router - this must come after data is loaded and header is rendered
    initializeRouter();
});





// Populate team filter dropdown
function populateTeamFilterDropdown() {
    const teamFilterSelect = document.getElementById('team-filter-select');
    if (!teamFilterSelect) return;

    // Load teams from localStorage
    const teams = loadTeams();

    // Clear existing options except the first one (Tüm Ekipler)
    teamFilterSelect.innerHTML = '<option value="">Tüm Ekipler</option>';

    // Add team options
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        teamFilterSelect.appendChild(option);
    });
}

// Setup table page event listeners (called when table.html is loaded)
function setupTablePage() {
    // Clear any filters from other pages
    currentTeamFilter = '';

    // Clear search input if it exists
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }

    // Reload data from localStorage to ensure we have the latest data
    const persisted = loadPersistedUsers();

    if (persisted && persisted.length > 0) {
        users = persisted.map(user => {
            if (user.batchIds && user.batchIds.length > 0) {
                user.websites = processUserWebsites(user);
            }
            return user;
        });
        filteredUsers = [...users];
        filterUsersByDateRange();
        updateUserTable(); // Render table with loaded data
        updateCharts(); // Render charts with loaded data
    } else {
        users = [];
        filteredUsers = [];
        // Still call render functions to show empty state
        updateUserTable();
        updateCharts();
    }

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

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            sortUsers(sortBy);
            updateUserTable();
        });
    }

    // Populate and setup team filter dropdown
    populateTeamFilterDropdown();
    const teamFilterSelect = document.getElementById('team-filter-select');
    if (teamFilterSelect) {
        teamFilterSelect.addEventListener('change', function() {
            currentTeamFilter = this.value;
            performDynamicSearch();
            updateCharts();
        });
    }

    // Reset All Filters button: reset date, search, and sort to defaults
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            resetAllFilters();
        });
    }

    // Search input - dynamic search as user types
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

    // Custom date range apply button
    const applyDateRangeBtn = document.getElementById('apply-date-range');
    if (applyDateRangeBtn) {
        applyDateRangeBtn.addEventListener('click', function() {
            // Use dates from custom calendar
            if (!selectedStartDate || !selectedEndDate) {
                turkishAlert('Lütfen başlangıç ve bitiş tarihlerini seçin.');
                return;
            }

            const start = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), 0, 0, 0);
            const end = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 23, 59, 59);
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
        });
    }

    // Custom date range cancel button
    const cancelDateRangeBtn = document.getElementById('cancel-date-range');
    if (cancelDateRangeBtn) {
        cancelDateRangeBtn.addEventListener('click', function() {
            hideCustomDatePopup();
        });
    }

    // Initialize custom calendars
    initializeCustomCalendars();

    // Modal export button
    const modalExportBtn = document.getElementById('modal-export-btn');
    if (modalExportBtn) {
        modalExportBtn.addEventListener('click', function() {
            exportUserCSV();
        });
    }

    // Modal search functionality
    const modalAppsSearch = document.getElementById('modal-apps-search');
    if (modalAppsSearch) {
        modalAppsSearch.addEventListener('input', function() {
            filterModalTable('apps', this.value);
        });
    }

    const modalWebsitesSearch = document.getElementById('modal-websites-search');
    if (modalWebsitesSearch) {
        modalWebsitesSearch.addEventListener('input', function() {
            filterModalTable('websites', this.value);
        });
    }

    // Modal close
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    const userModal = document.getElementById('user-modal');
    if (userModal) {
        userModal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }
}

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
    const updateDataBtn = document.getElementById('update-data-btn');
    if (updateDataBtn) {
        // Remove any existing listeners first to prevent duplicates
        updateDataBtn.removeEventListener('click', updateDataFromSupabase);
        // Add the listener
        updateDataBtn.addEventListener('click', updateDataFromSupabase);
    }

    // LOGOUT MODAL HANDLERS - DISABLED: Now handled by logout-modal.js
    // The new logout-modal.js file uses event delegation for better reliability

    /* Commented out to avoid conflicts with logout-modal.js
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Show custom logout modal
            const logoutModal = document.getElementById('logout-modal');
            if (logoutModal) {
                logoutModal.style.display = 'flex';
            }
        });
    }

    // Logout modal event listeners - Setup once with proper debugging
    const setupLogoutModalListeners = () => {
        const logoutCancelBtn = document.getElementById('logout-cancel');
        const logoutConfirmBtn = document.getElementById('logout-confirm');
        const logoutModal = document.getElementById('logout-modal');


        if (logoutCancelBtn) {
            // Remove any existing listeners by cloning
            const newCancelBtn = logoutCancelBtn.cloneNode(true);
            logoutCancelBtn.parentNode.replaceChild(newCancelBtn, logoutCancelBtn);

            newCancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const modal = document.getElementById('logout-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        }

        if (logoutConfirmBtn) {
            // Remove any existing listeners by cloning
            const newConfirmBtn = logoutConfirmBtn.cloneNode(true);
            logoutConfirmBtn.parentNode.replaceChild(newConfirmBtn, logoutConfirmBtn);

            newConfirmBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                const modal = document.getElementById('logout-modal');
                if (modal) {
                    modal.style.display = 'none';
                }

                try {

                    // Check if electronAPI is available
                    if (window.electronAPI && window.electronAPI.signOutUser) {
                        await window.electronAPI.signOutUser();
                    } else {
                    }

                    // Clear any local storage data
                    localStorage.clear();
                    sessionStorage.clear();

                    // Navigate to auth page after successful logout
                    window.location.href = 'auth.html';
                } catch (error) {
                    console.error('[DEBUG] Logout error:', error);
                    // Still navigate to auth page even if logout fails
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = 'auth.html';
                }
            });
        }

        // Close logout modal when clicking outside
        if (logoutModal) {
            // Clone to remove existing listeners
            const newModal = logoutModal.cloneNode(true);
            logoutModal.parentNode.replaceChild(newModal, logoutModal);

            newModal.addEventListener('click', function(e) {
                // Only close if clicking on the modal backdrop itself
                if (e.target === this) {
                    this.style.display = 'none';
                }
            });
        }
    };

    // Call the setup function
    setupLogoutModalListeners();
    */

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
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            sortUsers(sortBy);
            updateUserTable();
        });
    }
    
    // Removed per-page selector; always show all
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportToCSV();
        });
    }

    const modalExportBtn = document.getElementById('modal-export-btn');
    if (modalExportBtn) {
        modalExportBtn.addEventListener('click', function() {
            exportUserCSV();
        });
    }

    // Modal search functionality
    const modalAppsSearch = document.getElementById('modal-apps-search');
    if (modalAppsSearch) {
        modalAppsSearch.addEventListener('input', function() {
            filterModalTable('apps', this.value);
        });
    }

    const modalWebsitesSearch = document.getElementById('modal-websites-search');
    if (modalWebsitesSearch) {
        modalWebsitesSearch.addEventListener('input', function() {
            filterModalTable('websites', this.value);
        });
    }

    // Reset All Filters button: reset date, search, and sort to defaults
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            resetAllFilters();
        });
    }

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
    const applyDateRangeBtn = document.getElementById('apply-date-range');
    if (applyDateRangeBtn) {
        applyDateRangeBtn.addEventListener('click', function() {
        // Use dates from custom calendar
        if (!selectedStartDate || !selectedEndDate) {
            turkishAlert('Lütfen başlangıç ve bitiş tarihlerini seçin.');
            return;
        }

        const start = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), 0, 0, 0);
        const end = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 23, 59, 59);
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
        });
    }

    // Custom date range cancel button
    const cancelDateRangeBtn = document.getElementById('cancel-date-range');
    if (cancelDateRangeBtn) {
        cancelDateRangeBtn.addEventListener('click', function() {
            hideCustomDatePopup();
        });
    }

    // Modal close
    const modalCloseBtn = document.querySelector('.modal-close');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    const userModal = document.getElementById('user-modal');
    if (userModal) {
        userModal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }
}

// Custom date popup control functions
let startCalendar = null;
let endCalendar = null;

function initializeCustomCalendars() {
    const today = new Date();
    const oneYearAgo = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000));

    // Initialize start date calendar
    startCalendar = new TurkishCalendar('start-calendar', {
        type: 'range-start',
        minDate: oneYearAgo,
        maxDate: today,
        selectedDate: customStartDate || new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)),
        rangeStart: customStartDate,
        rangeEnd: customEndDate,
        onSelect: (date) => {
            selectedStartDate = date;
            const displayElement = document.getElementById('start-date-display');
            const dateText = displayElement.querySelector('.date-text');
            dateText.textContent = startCalendar.formatDateTurkish(date);

            // Update both calendars to show range
            if (selectedEndDate && date > selectedEndDate) {
                // If start date is after end date, swap them
                selectedEndDate = date;
                const endDisplayElement = document.getElementById('end-date-display');
                const endDateText = endDisplayElement.querySelector('.date-text');
                endDateText.textContent = endCalendar.formatDateTurkish(date);
            }

            if (endCalendar) {
                endCalendar.setRangeStart(date);
                endCalendar.setRangeEnd(selectedEndDate);
            }
            startCalendar.setRangeStart(date);
            startCalendar.setRangeEnd(selectedEndDate);

            // Close calendar
            document.getElementById('start-calendar-wrapper').classList.remove('show');
        }
    });

    // Initialize end date calendar
    endCalendar = new TurkishCalendar('end-calendar', {
        type: 'range-end',
        minDate: oneYearAgo,
        maxDate: today,
        selectedDate: customEndDate || today,
        rangeStart: customStartDate,
        rangeEnd: customEndDate,
        onSelect: (date) => {
            selectedEndDate = date;
            const displayElement = document.getElementById('end-date-display');
            const dateText = displayElement.querySelector('.date-text');
            dateText.textContent = endCalendar.formatDateTurkish(date);

            // Update both calendars to show range
            if (selectedStartDate && date < selectedStartDate) {
                // If end date is before start date, swap them
                selectedStartDate = date;
                const startDisplayElement = document.getElementById('start-date-display');
                const startDateText = startDisplayElement.querySelector('.date-text');
                startDateText.textContent = startCalendar.formatDateTurkish(date);
            }

            if (startCalendar) {
                startCalendar.setRangeStart(selectedStartDate);
                startCalendar.setRangeEnd(date);
            }
            endCalendar.setRangeStart(selectedStartDate);
            endCalendar.setRangeEnd(date);

            // Close calendar
            document.getElementById('end-calendar-wrapper').classList.remove('show');
        }
    });

    // Set initial display text
    const startDisplayElement = document.getElementById('start-date-display');
    const endDisplayElement = document.getElementById('end-date-display');
    const startDateText = startDisplayElement.querySelector('.date-text');
    const endDateText = endDisplayElement.querySelector('.date-text');

    if (customStartDate) {
        startDateText.textContent = startCalendar.formatDateTurkish(customStartDate);
        selectedStartDate = customStartDate;
    }
    if (customEndDate) {
        endDateText.textContent = endCalendar.formatDateTurkish(customEndDate);
        selectedEndDate = customEndDate;
    }

    // Setup click handlers for date inputs
    startDisplayElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = document.getElementById('start-calendar-wrapper');
        const endWrapper = document.getElementById('end-calendar-wrapper');
        endWrapper.classList.remove('show');
        wrapper.classList.toggle('show');
    });

    endDisplayElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = document.getElementById('end-calendar-wrapper');
        const startWrapper = document.getElementById('start-calendar-wrapper');
        startWrapper.classList.remove('show');
        wrapper.classList.toggle('show');
    });

    // Close calendars when clicking outside
    document.addEventListener('click', (e) => {
        const startWrapper = document.getElementById('start-calendar-wrapper');
        const endWrapper = document.getElementById('end-calendar-wrapper');
        const startDisplay = document.getElementById('start-date-display');
        const endDisplay = document.getElementById('end-date-display');

        if (startWrapper && startDisplay && !startWrapper.contains(e.target) && !startDisplay.contains(e.target)) {
            startWrapper.classList.remove('show');
        }
        if (endWrapper && endDisplay && !endWrapper.contains(e.target) && !endDisplay.contains(e.target)) {
            endWrapper.classList.remove('show');
        }
    });
}

function showCustomDatePopup() {
    const popup = document.getElementById('custom-date-selector');
    popup.style.display = 'block';

    if (!startCalendar || !endCalendar) {
        initializeCustomCalendars();
    }
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
// NOTE: This function is deprecated - we now use custom Turkish calendar
function initializeDateInputs(resetValues = true) {
    // No longer needed - using custom calendar
    return;

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
                            const batchDate = new Date(batch.d);
                            if (batchDate >= weekStart && batchDate < weekEnd) {
                                total += (batch.at || 0);
                            }
                        });
                    }
                });
                // Calculate average daily activity for the week (divide by 7 days)
                return total / Math.max(1, visibleUsers.length) / 7;
            })();
            data.push(Math.round(avgActivity));
        }
    } else if (currentPeriod === 'annual') {
        // Show average DAILY activity for each month of the year
        const today = new Date();
        const year = today.getFullYear();

        labels = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        data = [];

        for (let month = 0; month < 12; month++) {
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);

            const daysInMonth = monthEnd.getDate();

            let totalMonthActivity = 0;
            visibleUsers.forEach(user => {
                if (user.batchIds) {
                    user.batchIds.forEach(batch => {
                        const batchDate = new Date(batch.d);
                        if (batchDate >= monthStart && batchDate <= monthEnd) {
                            totalMonthActivity += (batch.at || 0);
                        }
                    });
                }
            });

            // Calculate average daily activity: total activity / users / days in month
            const avgDailyActivity = totalMonthActivity / Math.max(1, visibleUsers.length) / daysInMonth;
            data.push(Math.round(avgDailyActivity));
        }
    } else if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        // Generate labels based on custom date range
        const daysDiff = Math.ceil((customEndDate - customStartDate) / (1000 * 60 * 60 * 24));

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

    // Apply team filter if a team is selected
    if (currentTeamFilter) {
        const teams = loadTeams();
        const selectedTeam = teams.find(t => t.id === currentTeamFilter);
        if (selectedTeam && selectedTeam.members) {
            const teamUserIds = selectedTeam.members.map(m => m.userId);
            filteredUsers = filteredUsers.filter(user => {
                // Check both userId and id fields to ensure compatibility
                return teamUserIds.includes(user.userId) || teamUserIds.includes(user.userId?.toString()) || teamUserIds.includes(user.id?.toString());
            });
        }
    }

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

    // Reset team filter to default (all users)
    const teamFilterSelect = document.getElementById('team-filter-select');
    if (teamFilterSelect) {
        teamFilterSelect.value = '';
    }
    currentTeamFilter = '';

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

    // Clear custom date inputs and calendar selections
    selectedStartDate = null;
    selectedEndDate = null;

    // Reset calendar display text
    const startDisplayElement = document.getElementById('start-date-display');
    const endDisplayElement = document.getElementById('end-date-display');
    if (startDisplayElement) {
        const startDateText = startDisplayElement.querySelector('.date-text');
        if (startDateText) startDateText.textContent = 'Tarih seçin';
    }
    if (endDisplayElement) {
        const endDateText = endDisplayElement.querySelector('.date-text');
        if (endDateText) endDateText.textContent = 'Tarih seçin';
    }

    // Reset calendars
    if (startCalendar) {
        startCalendar.setSelectedDate(null);
        startCalendar.setRangeStart(null);
        startCalendar.setRangeEnd(null);
    }
    if (endCalendar) {
        endCalendar.setSelectedDate(null);
        endCalendar.setRangeStart(null);
        endCalendar.setRangeEnd(null);
    }

    // Apply filters and update display
    performDynamicSearch(); // This will apply date filters and empty search

    // Apply the default sort (name-az)
    sortUsers('name-az');

    toggleClearButton(); // Hide clear button since search is empty
    updateCharts();
}

function updateUserTable() {
    const tableBody = document.getElementById('users-table-body');

    // If table doesn't exist (e.g., we're on a different page), skip update
    if (!tableBody) {
        return;
    }

    // Check if no users found after filtering
    if (filteredUsers.length === 0) {
        tableBody.innerHTML = `
            <tr class="no-users-row">
                <td colspan="7" class="no-users-message">
                    <div class="empty-state-content">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <h3>Veri Bulunamadı</h3>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filteredUsers.map((user, index) => {
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

        const displayName = getDisplayName(user.userId);
        return `
        <tr class="clickable-row" onclick="openUserModal(${user.id})">
            <td class="row-number">${index + 1}</td>
            <td>
                <div class="user-name ${displayName.length > 25 ? 'truncated' : ''}" onclick="event.stopPropagation(); showFullUserName('${displayName.replace(/'/g, "\\'")}')" title="${displayName.length > 25 ? 'Click to see full name' : ''}">${displayName}</div>
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
                                const shortName = displayName.replace('https://', '').replace('http://', '').substring(0, 40);
                                return `<span class="website-tag" title="${displayName}">${shortName}${displayName.length > 40 ? '...' : ''}</span>`;
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
                <button class="view-details-btn" onclick="event.stopPropagation(); openUserModal(${user.id})">Detayları Görüntüle</button>
            </td>
        </tr>`;
    }).join('');
    
    // Pagination info removed; showing all users
}

function createCharts() {
    // Only create charts if we're on a page that has chart elements
    if (!document.getElementById('activity-chart')) {
        return;
    }

    updateChartHeader();
    createActivityChart();
    createAppsChart();
    createWebsitesChart();
    createTopUsersChart();
    createDailyTrendChart();
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
    const canvas = document.getElementById('activity-chart');
    if (!canvas) return; // Chart element doesn't exist on this page

    const ctx = canvas.getContext('2d');

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
                label: 'Günlük Ortalama Aktif Süre (saat)',
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
                            return `Günlük Ortalama: ${formatTimeForTooltip(seconds)}`;
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
    const canvas = document.getElementById('apps-chart');
    if (!canvas) return; // Chart element doesn't exist on this page

    const ctx = canvas.getContext('2d');

    const appCounts = {};
    filteredUsers.forEach(user => {
        // Filter user data by current date range to get accurate app usage
        const filteredUser = filterUserDataByDateRange(user);

        filteredUser.apps.forEach(app => {
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

function createWebsitesChart() {
    const ctx = document.getElementById('websites-chart')?.getContext('2d');
    if (!ctx) return;

    const websiteCounts = {};
    filteredUsers.forEach(user => {
        const filteredUser = filterUserDataByDateRange(user);

        if (filteredUser.websites && Array.isArray(filteredUser.websites)) {
            filteredUser.websites.forEach(website => {
                const websiteName = website.name || website.domain || 'Unknown';
                websiteCounts[websiteName] = (websiteCounts[websiteName] || 0) + (website.usage || 0);
            });
        }
    });

    const sortedWebsites = Object.entries(websiteCounts)
        .sort(([,a], [,b]) => b - a);

    const top5Websites = sortedWebsites.slice(0, 5);
    const otherWebsites = sortedWebsites.slice(5);
    const othersTotalUsage = otherWebsites.reduce((sum, [, usage]) => sum + usage, 0);

    let chartLabels = top5Websites.map(([name]) => name);
    let chartData = top5Websites.map(([, usage]) => usage);

    if (othersTotalUsage > 0) {
        chartLabels.push('Diğer');
        chartData.push(othersTotalUsage);
    }

    const hasData = chartData.length > 0 && chartData.some(usage => usage > 0);

    if (websitesChart) {
        websitesChart.destroy();
    }

    websitesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: hasData ? chartLabels : [],
            datasets: hasData ? [{
                data: chartData,
                backgroundColor: [
                    '#7BA098',
                    '#4A7B93',
                    '#A0C0D6',
                    '#7EA7A9',
                    '#B8E5E7',
                    '#324659'
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

function createTopUsersChart() {
    const ctx = document.getElementById('top-users-chart')?.getContext('2d');
    if (!ctx) return;

    // Calculate total active time per user in minutes
    const userTotals = filteredUsers.map(user => {
        const filteredUser = filterUserDataByDateRange(user);
        // Calculate total minutes from activeTime object
        const totalMinutes = (filteredUser.activeTime?.hours || 0) * 60 +
                           (filteredUser.activeTime?.minutes || 0) +
                           (filteredUser.activeTime?.seconds || 0) / 60;
        return {
            name: getDisplayName(user.userId) || 'Unknown',
            total: totalMinutes
        };
    });

    // Sort and get top 10
    const sortedUsers = userTotals
        .filter(u => u.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    const hasData = sortedUsers.length > 0;

    if (topUsersChart) {
        topUsersChart.destroy();
    }

    topUsersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hasData ? sortedUsers.map(u => u.name) : [],
            datasets: hasData ? [{
                label: 'Toplam Aktif Süre (saat)',
                data: sortedUsers.map(u => u.total / 60), // Convert minutes to hours
                backgroundColor: '#7BA098',
                borderColor: '#4A7B93',
                borderWidth: 1
            }] : []
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const hours = context.parsed.x;
                            const minutes = hours * 60;
                            return formatTimeForTooltip(minutes);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + 's';
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        },
        plugins: !hasData ? [noDataPlugin] : []
    });
}

function createDailyTrendChart() {
    const ctx = document.getElementById('daily-trend-chart')?.getContext('2d');
    if (!ctx) return;

    // Generate daily average data based on current period
    const chartData = generateChartData();
    const labels = chartData.labels;
    const data = chartData.data;

    const hasData = data.some(value => value !== null && value !== undefined && value > 0);
    const yAxisMax = calculateYAxisMax(data);

    if (dailyTrendChart) {
        dailyTrendChart.destroy();
    }

    dailyTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hasData ? labels : [],
            datasets: hasData ? [{
                label: 'Günlük Ortalama (saat)',
                data: data,
                borderColor: '#4A7B93',
                backgroundColor: 'rgba(74, 123, 147, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#7BA098',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
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
                            return formatTimeForTooltip(minutes);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: yAxisMax,
                    ticks: {
                        callback: function(value) {
                            return (value / 60).toFixed(1) + 'h';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        },
        plugins: !hasData ? [noDataPlugin] : []
    });
}

function updateChartHeader() {
    const today = new Date();
    let dateRangeText = '';

    // Calculate date range text based on current period
    if (currentPeriod === 'daily') {
        const todayStr = today.toLocaleDateString('tr-TR');
        dateRangeText = `Bugün (${todayStr})`;
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
        dateRangeText = `Haftalık (${mondayStr} - ${sundayStr})`;
    } else if (currentPeriod === 'monthly') {
        // Calculate 1st of month to end of month
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const firstStr = firstDay.toLocaleDateString('tr-TR');
        const lastStr = lastDay.toLocaleDateString('tr-TR');
        dateRangeText = `Aylık (${firstStr} - ${lastStr})`;
    } else if (currentPeriod === 'annual') {
        // Calculate January 1st to December 31st
        const firstDay = new Date(today.getFullYear(), 0, 1);
        const lastDay = new Date(today.getFullYear(), 11, 31);

        const firstStr = firstDay.toLocaleDateString('tr-TR');
        const lastStr = lastDay.toLocaleDateString('tr-TR');
        dateRangeText = `Yıllık (${firstStr} - ${lastStr})`;
    } else if (currentPeriod === 'custom' && customStartDate && customEndDate) {
        const startStr = customStartDate.toLocaleDateString('tr-TR');
        const endStr = customEndDate.toLocaleDateString('tr-TR');
        dateRangeText = `Özel (${startStr} - ${endStr})`;
    }

    // Update all chart titles with date range
    const activityTitle = document.getElementById('activity-chart-title');
    const topUsersTitle = document.getElementById('top-users-chart-title');
    const appsTitle = document.getElementById('apps-chart-title');
    const websitesTitle = document.getElementById('websites-chart-title');
    const dailyTrendTitle = document.getElementById('daily-trend-chart-title');

    if (activityTitle) {
        activityTitle.textContent = `Aktivite Genel Bakış - ${dateRangeText}`;
    }
    if (topUsersTitle) {
        topUsersTitle.textContent = `En Aktif Kullanıcılar - ${dateRangeText}`;
    }
    if (appsTitle) {
        appsTitle.textContent = `Uygulama Kullanım Dağılımı - ${dateRangeText}`;
    }
    if (websitesTitle) {
        websitesTitle.textContent = `Web Sitesi Kullanım Dağılımı - ${dateRangeText}`;
    }
    if (dailyTrendTitle) {
        dailyTrendTitle.textContent = `Günlük Ortalama Aktivite Trendi - ${dateRangeText}`;
    }
}

function updateCharts() {
    updateChartHeader();
    createActivityChart();
    createAppsChart();
    createWebsitesChart();
    createTopUsersChart();
    createDailyTrendChart();
}

function filterUserDataByDateRange(user) {
    const filteredUser = JSON.parse(JSON.stringify(user));

    // Get date range for filtering
    const { startDate, endDate } = getDateRangeForPeriod();

    // Filter batches based on date_tracked
    if (filteredUser.batchIds) {
        filteredUser.batchIds = filteredUser.batchIds.filter(batch => {
            const batchDateStr = batch.d || batch.batch_data?.d || batch.date_tracked || batch.d?.split?.('T')[0];
            if (!batchDateStr) {
                return false;
            }

            const isInRange = batchDateStr >= startDate && batchDateStr <= endDate;
            return isInRange;
        });
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

    return filteredUser;
}

function getDateRangeForPeriod() {
    const today = new Date();
    let startDate, endDate;

    if (currentPeriod === 'daily') {
        // Use local timezone for daily date
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
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
    const appsMap = new Map();

    if (user.batchIds) {
        user.batchIds.forEach((batch) => {
            const appsData = batch.ap || batch.batch_data?.ap || batch.batch_data?.apps || {};
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
    return result;
}

function processUserWebsites(user) {
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

    // Scroll modal content to top
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }
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
    const appsCanvas = document.getElementById('modal-apps-chart');
    if (!appsCanvas) return; // Chart element doesn't exist

    const appsCtx = appsCanvas.getContext('2d');

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

    const websitesCanvas = document.getElementById('modal-websites-chart');
    if (!websitesCanvas) return; // Chart element doesn't exist on this page
    const websitesCtx = websitesCanvas.getContext('2d');
    
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

    if (diffMinutes < 1) {
        return 'Şimdi';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}<br>dakika&nbsp;önce`;
    } else if (diffHours < 24) {
        return `${diffHours}<br>saat&nbsp;önce`;
    } else if (diffDays < 30) {
        return `${diffDays}<br>gün&nbsp;önce`;
    } else {
        // Calculate months and years more accurately
        const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 +
                          (now.getMonth() - date.getMonth());

        if (diffMonths < 12) {
            return `${diffMonths}<br>ay&nbsp;önce`;
        } else {
            const diffYears = Math.floor(diffMonths / 12);
            return `${diffYears}<br>yıl&nbsp;önce`;
        }
    }
}

// Supabase functions
// Flag to prevent multiple simultaneous updates
let isUpdatingData = false;

// Alias for updateDataFromSupabase to maintain compatibility
async function loadAllUserData() {
    return await updateDataFromSupabase();
}

async function updateDataFromSupabase() {
    // Prevent multiple simultaneous updates
    if (isUpdatingData) {
        return;
    }

    isUpdatingData = true;
    const updateBtn = document.getElementById('update-data-btn');
    const originalContent = updateBtn ? updateBtn.innerHTML : null;

    try {
        // Show loading popup immediately
        showLoadingPopup('Veriler Güncelleniyor');

        // Step 1: Change button state to loading (only if button exists)
        if (updateBtn) {
            updateBtn.innerHTML = 'Veriler Güncelleniyor';
            updateBtn.disabled = true;
        }

        // Step 2: Fetch data from Supabase
        const data = await fetchDataFromSupabase();
        
        if (data && data.length > 0) {
            // Step 3: Get user IDs and fetch real names
            updateLoadingPopup('Kullanıcı İsimleri Getiriliyor');
            if (updateBtn) {
                updateBtn.innerHTML = 'Veriler Güncelleniyor';
            }

            const userIds = extractUserIds(data);

            const userNames = await fetchUserNames(userIds);

            // Step 4: Process the data with real names
            updateLoadingPopup('Veriler İnceleniyor');
            if (updateBtn) {
                updateBtn.innerHTML = 'Veriler Güncelleniyor';
            }
            const newUsers = processSupabaseData(data, userNames) || [];

            // After processing, merge with existing persisted data
            const persisted = loadPersistedUsers();
            const merged = mergeCumulativeUsers(persisted, newUsers);
            savePersistedUsers(merged);
            users = merged;

            // Re-apply all filters (date range, search, and sort)
            performDynamicSearch();

            renderDashboard();
            updateUserTable();
            updateCharts();
            
            // Step 5: Update button state
            if (updateBtn) {
                updateBtn.innerHTML = 'Veriler Güncelleniyor';
            }

            // Step 6: Confirm receipt (you can customize this part based on your needs)
            await confirmDataReceipt(data.length);

            // Step 7: Delete all data from Supabase table
            updateLoadingPopup('Kayıtlar İşleniyor');
            if (updateBtn) {
                updateBtn.innerHTML = 'Veriler Güncelleniyor';
            }
            await deleteAllDataFromSupabase();
            
            // Step 7: Success
            if (updateBtn) {
                updateBtn.innerHTML = 'Veriler Güncelleniyor';
            }

            // Hide loading popup and show success message
            hideLoadingPopup();
            setTimeout(() => {
                turkishAlert('Veriler Başarıyla Güncellendi');
            }, 100);
            
        } else {
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
        // Reset the flag to allow future updates
        isUpdatingData = false;

        // Reset button after 3 seconds (only if button exists)
        if (updateBtn) {
            setTimeout(() => {
                updateBtn.innerHTML = originalContent;
                updateBtn.disabled = false;
            }, 3000);
        }
    }
}

async function fetchDataFromSupabase() {
    let allData = [];
    let rangeStart = 0;
    const rangeSize = 1000; // Supabase's max limit per request
    let hasMore = true;
    let totalFetched = 0;


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

            // If we got fewer records than requested, we've reached the end
            if (data.length < rangeSize) {
                hasMore = false;
            } else {
                // Move to next page
                rangeStart += rangeSize;
            }
        } else {
            // No more data
            hasMore = false;
        }
    }

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
        return;
    }
    
    // Delete all records with a condition that matches all records
    // Using ?id=gte.0 to delete all records where id >= 0
    const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=gte.0`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
    });

    if (!deleteResponse.ok) {
        throw new Error(`Failed to delete records: ${deleteResponse.status}`);
    }
    
}

// Function to clear all local user data
function clearAllLocalData() {
    if (confirm('Are you sure you want to delete all local user data? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        users = [];
        filteredUsers = [];
        updateUserTable();
        updateCharts();
        alert('Local user data cleared successfully');
    }
}

// Make function available globally for console access
window.clearAllLocalData = clearAllLocalData;

function extractUserIds(data) {
    // Extract unique user_ids from the Supabase data
    
    // Check what fields are available in the first record
    if (data.length > 0) {
    }
    
    const userIds = [...new Set(data.map(record => {
        return record.user_id;
    }).filter(id => id != null))];
    
    return userIds;
}

async function fetchUserNames(userIds) {
    // Send user_ids to N8N webhook and get back real names
    try {
        
        const requestPayload = {
            user_ids: userIds,
            source: 'activity_tracker_admin',
            timestamp: new Date().toISOString()
        };
        
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload)
        });
        
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Webhook error response:', errorText);
            throw new Error(`Webhook request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const result = await response.json();
        
        // Try different possible response formats
        let userNames = {};
        
        // If the result is wrapped (e.g., {data: [...]} or similar), unwrap it
        let dataArray = result;
        if (result.data && Array.isArray(result.data)) {
            dataArray = result.data;
        } else if (result.items && Array.isArray(result.items)) {
            dataArray = result.items;
        } else if (result.result && Array.isArray(result.result)) {
            dataArray = result.result;
        }
        
        if (result.user_names) {
            userNames = result.user_names;
        } else if (result.data && result.data.user_names) {
            userNames = result.data.user_names;
        } else if (Array.isArray(dataArray)) {
            // Handle N8N array format with "Employee Name" and "Employee Number"
            dataArray.forEach(item => {
                
                // Handle different possible field names
                const employeeNumber = item["Employee Number"] || item.employee_number || item.Employee_Number;
                const employeeName = item["Employee Name"] || item.employee_name || item.Employee_Name;
                
                if (employeeNumber && employeeName) {
                    userNames[employeeNumber.toString()] = employeeName;
                }
            });
        } else {
            // Try to use the result directly if it looks like a user mapping
            if (typeof result === 'object' && result !== null) {
                userNames = result;
            }
        }
        
        return userNames;
        
    } catch (error) {
        console.error('Error fetching user names from webhook:', error);
        // Return empty object if webhook fails, will use fallback names
        return {};
    }
}

function mergeUserRecords(userRecords, userId, userNames) {
    // Merge multiple activity records for the same user into a single user object
    
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
        
        // Find latest activity - use batch_end_time only if there's significant active time
        // This prevents showing "Şimdi" when computer is just in sleep mode sending empty batches
        // Note: batch_end_time is TIME type, so we need to combine it with date_tracked

        const batchActiveTime = parseFloat(record.active_time_seconds || batchData.at || 0);

        // Only consider this batch if it has meaningful active time (at least 1 full second)
        // This filters out sub-second noise like 0.24s, 0.48s, 0.80s which are background processes
        // or brief mouse movements when computer wakes from sleep
        const hasRealActivity = batchActiveTime >= 1.0;

        if (hasRealActivity) {
            let recordActivity;
            if (record.batch_end_time && record.date_tracked) {
                // Combine date_tracked (date) with batch_end_time (time)
                const dateStr = record.date_tracked; // e.g., "2025-11-05"
                const timeStr = record.batch_end_time; // e.g., "18:31:46"
                recordActivity = new Date(`${dateStr}T${timeStr}`);
            } else if (batchData.e) {
                // Fallback to batch data end time (full timestamp)
                recordActivity = new Date(batchData.e);
            } else if (record.created_at) {
                // Last resort fallback
                recordActivity = new Date(record.created_at);
            } else {
                recordActivity = new Date();
            }

            // Only update if we got a valid date
            if (!isNaN(recordActivity.getTime())) {
                if (!latestActivity || recordActivity > latestActivity) {
                    latestActivity = recordActivity;
                }
            } else {
            }
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

    // Convert apps and websites objects to arrays, sorted by usage
    const appsArray = Object.values(allApps).sort((a, b) => b.usage - a.usage);
    const websitesArray = Object.values(allWebsites).sort((a, b) => b.usage - a.usage);
    

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
        lastActivity: latestActivity || null,
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
    
    
    if (data.length === 0) {
        return [];
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
        
        
        // Process each user group to merge their activity data
        const processedUsers = Object.keys(userGroups).map(userId => {
            const userRecords = userGroups[userId];
            
            // Merge all records for this user
            const mergedUser = mergeUserRecords(userRecords, userId, userNames);
            return mergedUser;
        });
        
        // Return processed users instead of directly updating global array
        // This allows proper merging with persisted data
        return processedUsers;
        
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

            // Update sidebar user profile
            const sidebarUserName = document.getElementById('sidebar-user-name');
            const sidebarUserRole = document.getElementById('sidebar-user-role');

            if (sidebarUserName) sidebarUserName.textContent = userName;
            if (sidebarUserRole) sidebarUserRole.textContent = lawFirmName;

        } else {
            throw new Error('No user data available');
        }
    } catch (error) {
        console.error('Error loading user session:', error);

        // Update sidebar with fallback values
        const sidebarUserName = document.getElementById('sidebar-user-name');
        const sidebarUserRole = document.getElementById('sidebar-user-role');

        if (sidebarUserName) sidebarUserName.textContent = 'Kullanıcı';
        if (sidebarUserRole) sidebarUserRole.textContent = 'Hukuk Bürosu';
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

    // Get the target date based on current period
    const targetDate = getTargetDateForTimeline();

    // Generate timeline data (1440 minutes in a day)
    const timelineData = generateTimelineData(user, targetDate);

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


    // Process each batch
    dayBatches.forEach((batch, batchIndex) => {

        // Parse start and end times
        const startTime = parseTimeToMinutes(batch.s || batch.batch_start_time);
        const endTime = parseTimeToMinutes(batch.e || batch.batch_end_time);

        if (startTime === null || endTime === null) {
            return;
        }


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
            }
        }

        const totalSeconds = adjustedActiveTime + adjustedInactiveTime;
        const activeRatio = totalSeconds > 0 ? adjustedActiveTime / totalSeconds : 0;


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

// ============================================================================
// ÇALIŞANLAR PAGE FUNCTIONS
// ============================================================================

let calisanlarData = [];
let filteredCalisanlarData = [];
let userToDelete = null;

function setupCalisanlarPage() {
    loadCalisanlarData();
    setupCalisanlarEventListeners();
}

function loadCalisanlarData() {
    // Always load fresh from localStorage to ensure we have all users
    const allUsers = loadPersistedUsers();


    if (!allUsers || allUsers.length === 0) {
        calisanlarData = [];
        filteredCalisanlarData = [];
        renderCalisanlarTable();
        return;
    }

    // Transform users data into çalışanlar format
    calisanlarData = allUsers.map(user => {
        // Calculate first and last data dates
        let firstDataDate = null;
        let lastDataDate = null;

        // Use lastActivity for last data
        if (user.lastActivity) {
            lastDataDate = new Date(user.lastActivity);
        }

        // Try to find earliest and latest dates from batchIds
        if (user.batchIds && Array.isArray(user.batchIds) && user.batchIds.length > 0) {
            try {
                const dates = user.batchIds.map(batchId => {
                    // Check if batchId is an object (which is the case based on mergeUserRecords)
                    if (typeof batchId === 'object' && batchId !== null && !(batchId instanceof Date)) {
                        // Try date_tracked first (most reliable)
                        if (batchId.date_tracked) {
                            const parsed = new Date(batchId.date_tracked);
                            if (!isNaN(parsed.getTime())) return parsed;
                        }
                        // Try created_at
                        if (batchId.created_at) {
                            const parsed = new Date(batchId.created_at);
                            if (!isNaN(parsed.getTime())) return parsed;
                        }
                        // Try combining date_tracked with batch_start_time
                        if (batchId.date_tracked && batchId.batch_start_time) {
                            const parsed = new Date(`${batchId.date_tracked}T${batchId.batch_start_time}`);
                            if (!isNaN(parsed.getTime())) return parsed;
                        }
                        // Try combining date_tracked with batch_end_time
                        if (batchId.date_tracked && batchId.batch_end_time) {
                            const parsed = new Date(`${batchId.date_tracked}T${batchId.batch_end_time}`);
                            if (!isNaN(parsed.getTime())) return parsed;
                        }
                        // Try 's' field (batch start timestamp)
                        if (batchId.s) {
                            const parsed = new Date(batchId.s);
                            if (!isNaN(parsed.getTime())) return parsed;
                        }
                        // Try 'e' field (batch end timestamp)
                        if (batchId.e) {
                            const parsed = new Date(batchId.e);
                            if (!isNaN(parsed.getTime())) return parsed;
                        }
                        // Try 'd' field (date string)
                        if (batchId.d) {
                            const parsed = new Date(batchId.d);
                            if (!isNaN(parsed.getTime())) return parsed;
                        }
                    }
                    // Check if batchId is a Date object
                    else if (batchId instanceof Date) {
                        return batchId;
                    }
                    // Check if batchId is a string
                    else if (typeof batchId === 'string') {
                        const parsed = new Date(batchId);
                        if (!isNaN(parsed.getTime())) return parsed;
                    } else if (typeof batchId === 'number') {
                        // Might be a timestamp
                        return new Date(batchId);
                    }
                    return null;
                }).filter(date => date !== null && !isNaN(date.getTime()));

                if (dates.length > 0) {
                    // Find earliest date for İlk Veri
                    firstDataDate = new Date(Math.min(...dates.map(d => d.getTime())));
                    // Find latest date for Son Veri
                    const latestFromBatchIds = new Date(Math.max(...dates.map(d => d.getTime())));
                    // Use the later of lastActivity or latest from batchIds
                    if (!lastDataDate || latestFromBatchIds > lastDataDate) {
                        lastDataDate = latestFromBatchIds;
                    }
                }
            } catch (error) {
            }
        }

        // Fallback: if we still don't have firstDataDate, use lastDataDate
        if (!firstDataDate && lastDataDate) {
            firstDataDate = lastDataDate;
        }

        return {
            userId: user.userId,
            name: user.name,
            firstData: firstDataDate,
            lastData: lastDataDate,
            activeTime: user.activeTime ? user.activeTime.total : 0,
            appCount: user.apps ? user.apps.length : 0,
            websiteCount: user.websites ? user.websites.length : 0,
            sessionCount: user.sessionCount || 0
        };
    });

    filteredCalisanlarData = [...calisanlarData];
    // Apply default A-Z sorting
    sortCalisanlarData('name-az');
    renderCalisanlarTable();
}

function setupCalisanlarEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('calisanlar-search');
    const clearSearchBtn = document.getElementById('calisanlar-clear-search');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            filterCalisanlarData(searchTerm);

            // Show/hide clear button
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchTerm ? 'flex' : 'none';
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                filterCalisanlarData('');
                clearSearchBtn.style.display = 'none';
            }
        });
    }

    // Sort select
    const sortSelect = document.getElementById('calisanlar-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortCalisanlarData(e.target.value);
        });
    }

    // Delete modal buttons
    const deleteModal = document.getElementById('delete-user-modal');
    const deleteConfirmBtn = document.getElementById('delete-user-confirm');
    const deleteCancelBtn = document.getElementById('delete-user-cancel');

    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', () => {
            if (userToDelete) {
                performUserDeletion(userToDelete);
                deleteModal.style.display = 'none';
                userToDelete = null;
            }
        });
    }

    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            userToDelete = null;
        });
    }

    // Close modal when clicking outside
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.style.display = 'none';
                userToDelete = null;
            }
        });
    }

    // Event delegation for edit and delete buttons in Çalışanlar table
    const tbody = document.getElementById('calisanlar-tbody');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.calisan-edit-btn');
            const deleteBtn = e.target.closest('.calisan-delete-btn');

            if (editBtn) {
                e.stopPropagation();
                const userId = editBtn.getAttribute('data-user-id');
                const displayName = editBtn.getAttribute('data-display-name');
                openEditUsernameModal(userId, displayName);
            } else if (deleteBtn) {
                e.stopPropagation();
                const userId = deleteBtn.getAttribute('data-user-id');
                const displayName = deleteBtn.getAttribute('data-display-name');
                showDeleteUserModal(userId, displayName);
            }
        });
    }
}

function filterCalisanlarData(searchTerm) {
    if (!searchTerm) {
        filteredCalisanlarData = [...calisanlarData];
    } else {
        // Normalize search term for Turkish character matching
        const normalizedSearch = normalizeForTurkishSearch(searchTerm);

        filteredCalisanlarData = calisanlarData.filter(user => {
            const normalizedName = normalizeForTurkishSearch(user.name);
            return normalizedName.includes(normalizedSearch);
        });
    }
    renderCalisanlarTable();
}

function sortCalisanlarData(sortType) {
    filteredCalisanlarData.sort((a, b) => {
        switch (sortType) {
            case 'name-az':
                return a.name.localeCompare(b.name, 'tr');
            case 'name-za':
                return b.name.localeCompare(a.name, 'tr');
            case 'active-time-desc':
                return b.activeTime - a.activeTime;
            case 'active-time-asc':
                return a.activeTime - b.activeTime;
            case 'first-data-recent':
                const aFirstTime = a.firstData ? a.firstData.getTime() : 0;
                const bFirstTime = b.firstData ? b.firstData.getTime() : 0;
                return bFirstTime - aFirstTime;
            case 'first-data-oldest':
                const aFirstTimeOld = a.firstData ? a.firstData.getTime() : 0;
                const bFirstTimeOld = b.firstData ? b.firstData.getTime() : 0;
                return aFirstTimeOld - bFirstTimeOld;
            case 'last-data-recent':
                const aLastTime = a.lastData ? a.lastData.getTime() : 0;
                const bLastTime = b.lastData ? b.lastData.getTime() : 0;
                return bLastTime - aLastTime;
            case 'last-data-oldest':
                const aLastTimeOld = a.lastData ? a.lastData.getTime() : 0;
                const bLastTimeOld = b.lastData ? b.lastData.getTime() : 0;
                return aLastTimeOld - bLastTimeOld;
            default:
                return 0;
        }
    });
    renderCalisanlarTable();
}

function renderCalisanlarTable() {
    const tbody = document.getElementById('calisanlar-tbody');
    const countElement = document.getElementById('calisanlar-count');


    if (!tbody) {
        console.error('Çalışanlar tbody element not found!');
        return;
    }

    // Update count
    if (countElement) {
        countElement.textContent = `${filteredCalisanlarData.length} çalışan`;
    }

    // Show message if no data
    if (filteredCalisanlarData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem; color: #6c757d;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Henüz Çalışan Verisi Bulunmuyor</div>
                    <div style="font-size: 0.9rem;">Verileri güncelleyerek çalışan listesini görüntüleyebilirsiniz.</div>
                </td>
            </tr>
        `;
        return;
    }

    // Render rows
    tbody.innerHTML = filteredCalisanlarData.map((user, index) => {
        const firstDataStr = user.firstData ? formatDateTurkish(user.firstData) : '-';
        const lastDataStr = user.lastData ? formatDateTurkish(user.lastData) : '-';
        const activeTimeStr = formatSecondsToHMS(user.activeTime);
        const displayName = getDisplayName(user.userId);

        return `
            <tr>
                <td class="row-number">${index + 1}</td>
                <td>${escapeHtml(displayName)}</td>
                <td>${firstDataStr}</td>
                <td>${lastDataStr}</td>
                <td>${activeTimeStr}</td>
                <td>${user.appCount}</td>
                <td>${user.websiteCount}</td>
                <td>
                    <div class="action-cell-wrapper">
                        <button class="actions-menu-btn" onclick="event.stopPropagation(); toggleActionsMenu('calisan-${index}', '${user.userId.replace(/'/g, "\\'")}', '${displayName.replace(/'/g, "\\'")}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2"></circle>
                                <circle cx="12" cy="12" r="2"></circle>
                                <circle cx="12" cy="19" r="2"></circle>
                            </svg>
                        </button>
                        <div class="actions-dropdown" id="actions-dropdown-calisan-${index}">
                            <button class="actions-dropdown-item edit calisan-edit-btn" data-user-id="${escapeHtml(user.userId)}" data-display-name="${escapeHtml(displayName)}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Düzenle
                            </button>
                            <button class="actions-dropdown-item delete calisan-delete-btn" data-user-id="${escapeHtml(user.userId)}" data-display-name="${escapeHtml(displayName)}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Sil
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function formatDateTurkish(date) {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatSecondsToHMS(seconds) {
    if (!seconds || seconds === 0) return '0sa 0dk 0sn';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours}sa ${minutes}dk ${secs}sn`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showDeleteUserModal(userId, userName) {
    const modal = document.getElementById('delete-user-modal');
    const userNameElement = document.getElementById('delete-user-name');

    if (!modal || !userNameElement) return;

    userToDelete = userId;
    userNameElement.textContent = userName;
    modal.style.display = 'flex';
}

function performUserDeletion(userId) {

    // Load current persisted users
    const persistedUsers = loadPersistedUsers();

    // Filter out the user to delete
    const updatedUsers = persistedUsers.filter(user => user.userId !== userId);

    // Save back to localStorage
    savePersistedUsers(updatedUsers);

    // Update global users array
    users = updatedUsers;
    filteredUsers = [...users];

    // Reload çalışanlar data
    loadCalisanlarData();

    // Update other pages if they're currently visible
    const currentPage = router.getCurrentPage();
    if (currentPage === 'dashboard') {
        filterUsersByDateRange();
        renderDashboard();
        updateCharts();
    } else if (currentPage === 'table') {
        updateUserTable();
    } else if (currentPage === 'reports') {
        // Refresh reports if needed
        if (typeof setupReportsPage === 'function') {
            setupReportsPage();
        }
    }

    // Show success message
    setTimeout(() => {
        turkishAlert(`${userId} kullanıcısının tüm verileri başarıyla silindi.`);
    }, 100);
}

// ============================================================================
// EKIPLER (TEAMS) PAGE FUNCTIONALITY
// ============================================================================

// Teams data management
let teamsData = [];
let filteredTeamsData = [];
let currentEditingTeam = null;
const TEAMS_STORAGE_KEY = 'kta_teams_v1';

// Load teams from localStorage
function loadTeams() {
    try {
        const stored = localStorage.getItem(TEAMS_STORAGE_KEY);
        if (stored) {
            teamsData = JSON.parse(stored);
        } else {
            teamsData = [];
        }
        return teamsData;
    } catch (error) {
        console.error('Error loading teams:', error);
        teamsData = [];
        return [];
    }
}

// Save teams to localStorage
function saveTeams(teams) {
    try {
        localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
        return true;
    } catch (error) {
        console.error('Error saving teams:', error);
        return false;
    }
}

// Setup Ekipler page
function setupEkiplerPage() {
    loadTeams();
    filteredTeamsData = [...teamsData];
    renderTeamsGrid();
    setupEkiplerEventListeners();
}

// Setup event listeners for Ekipler page
function setupEkiplerEventListeners() {
    // Create team button
    const createTeamBtn = document.getElementById('create-team-btn');
    if (createTeamBtn) {
        createTeamBtn.addEventListener('click', () => {
            openCreateTeamModal();
        });
    } else {
        console.error('Create team button not found!');
    }

    // Team search
    const teamsSearch = document.getElementById('teams-search');
    if (teamsSearch) {
        teamsSearch.addEventListener('input', (e) => {
            filterTeamsData(e.target.value);
        });
    }

    // Clear search button
    const clearSearchBtn = document.getElementById('teams-clear-search');
    if (clearSearchBtn && teamsSearch) {
        clearSearchBtn.addEventListener('click', () => {
            teamsSearch.value = '';
            clearSearchBtn.style.display = 'none';
            filterTeamsData('');
        });

        teamsSearch.addEventListener('input', (e) => {
            clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
        });
    }

    // Team modal event listeners
    setupTeamModalListeners();
}

// Setup team modal listeners
function setupTeamModalListeners() {
    // Close modal buttons
    const teamModalClose = document.getElementById('team-modal-close');
    const teamModalCancel = document.getElementById('team-modal-cancel');
    if (teamModalClose) teamModalClose.addEventListener('click', closeTeamModal);
    if (teamModalCancel) teamModalCancel.addEventListener('click', closeTeamModal);

    // Close modal when clicking outside
    const teamModal = document.getElementById('team-modal');
    if (teamModal) {
        teamModal.addEventListener('click', (e) => {
            if (e.target === teamModal) {
                closeTeamModal();
            }
        });
    }

    const viewTeamModal = document.getElementById('view-team-modal');
    if (viewTeamModal) {
        viewTeamModal.addEventListener('click', (e) => {
            if (e.target === viewTeamModal) {
                closeViewTeamModal();
            }
        });
    }

    const deleteTeamModal = document.getElementById('delete-team-modal');
    if (deleteTeamModal) {
        deleteTeamModal.addEventListener('click', (e) => {
            if (e.target === deleteTeamModal) {
                closeDeleteTeamModal();
            }
        });
    }

    // Save team button
    const saveBtn = document.getElementById('team-modal-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveTeam);
    }

    // Employee search in modal
    const employeeSearch = document.getElementById('employee-search');
    if (employeeSearch) {
        employeeSearch.addEventListener('input', (e) => {
            filterEmployeeList(e.target.value);
        });
    }

    // View team modal close
    const viewTeamModalClose = document.getElementById('view-team-modal-close');
    if (viewTeamModalClose) {
        viewTeamModalClose.addEventListener('click', closeViewTeamModal);
    }

    // Edit team button
    const editTeamBtn = document.getElementById('edit-team-btn');
    if (editTeamBtn) {
        editTeamBtn.addEventListener('click', () => {
            if (currentEditingTeam) {
                closeViewTeamModal();
                openEditTeamModal(currentEditingTeam);
            }
        });
    }

    // Delete team button
    const deleteTeamBtn = document.getElementById('delete-team-btn');
    if (deleteTeamBtn) {
        deleteTeamBtn.addEventListener('click', () => {
            if (currentEditingTeam) {
                showDeleteTeamModal(currentEditingTeam.id, currentEditingTeam.name);
            }
        });
    }

    // Delete confirmation modal
    const deleteTeamCancel = document.getElementById('delete-team-cancel');
    const deleteTeamConfirm = document.getElementById('delete-team-confirm');
    if (deleteTeamCancel) {
        deleteTeamCancel.addEventListener('click', closeDeleteTeamModal);
    }
    if (deleteTeamConfirm) {
        deleteTeamConfirm.addEventListener('click', confirmDeleteTeam);
    }
}

// Filter teams by search term
function filterTeamsData(searchTerm) {
    const normalizedSearch = normalizeForTurkishSearch(searchTerm);
    filteredTeamsData = teamsData.filter(team => {
        const normalizedName = normalizeForTurkishSearch(team.name);
        const normalizedDesc = normalizeForTurkishSearch(team.description || '');
        return normalizedName.includes(normalizedSearch) || normalizedDesc.includes(normalizedSearch);
    });
    renderTeamsGrid();
}

// Render teams grid
function renderTeamsGrid() {
    const teamsGrid = document.getElementById('teams-grid');
    const emptyState = document.getElementById('teams-empty-state');
    const countElement = document.getElementById('teams-count');

    if (!teamsGrid) return;

    // Update count
    if (countElement) {
        countElement.textContent = `${filteredTeamsData.length} ekip`;
    }

    // Show/hide empty state
    if (filteredTeamsData.length === 0) {
        teamsGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    teamsGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    // Render team cards
    teamsGrid.innerHTML = filteredTeamsData.map(team => {
        const memberCount = team.members ? team.members.length : 0;
        const createdDate = team.createdAt ? formatDateTurkish(new Date(team.createdAt)) : '-';

        return `
            <div class="team-card" onclick="viewTeamDetails('${team.id}')">
                <div class="team-card-header">
                    <div class="team-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <div class="team-card-title">
                        <h3>${escapeHtml(team.name)}</h3>
                        <span class="team-member-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                            ${memberCount} üye
                        </span>
                    </div>
                </div>
                ${team.description ? `<div class="team-card-description">${escapeHtml(team.description)}</div>` : ''}
                <div class="team-card-footer">
                    <div class="team-card-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${createdDate}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Open create team modal
function openCreateTeamModal() {
    currentEditingTeam = null;
    const modal = document.getElementById('team-modal');
    const title = document.getElementById('team-modal-title');


    if (title) title.textContent = 'Yeni Ekip Oluştur';

    // Reset form
    resetTeamForm();

    // Load employee list
    loadEmployeeList();

    // Show modal
    if (modal) {
        modal.classList.add('show');
    } else {
        console.error('Modal element not found!');
    }
}

// Open edit team modal
function openEditTeamModal(team) {
    currentEditingTeam = team;
    const modal = document.getElementById('team-modal');
    const title = document.getElementById('team-modal-title');

    if (title) title.textContent = 'Ekibi Düzenle';

    // Fill form with team data
    document.getElementById('team-name').value = team.name;

    // Load employee list with selections
    loadEmployeeList(team.members || []);

    // Show modal
    if (modal) modal.classList.add('show');
}

// Close team modal
function closeTeamModal() {
    const modal = document.getElementById('team-modal');
    if (modal) modal.classList.remove('show');
    resetTeamForm();
}

// Reset team form
function resetTeamForm() {
    const teamName = document.getElementById('team-name');
    const empSearch = document.getElementById('employee-search');
    const selectedCount = document.getElementById('selected-count');
    const selectedSection = document.getElementById('selected-employees-section');

    if (teamName) teamName.value = '';
    if (empSearch) empSearch.value = '';
    if (selectedCount) selectedCount.textContent = '0 çalışan seçildi';
    if (selectedSection) selectedSection.style.display = 'none';
}

// Load employee list for selection
function loadEmployeeList(selectedMembers = []) {
    const employeeList = document.getElementById('employee-list');
    if (!employeeList) return;

    const allUsers = loadPersistedUsers();

    // Sort users alphabetically by display name
    const sortedUsers = allUsers.sort((a, b) => {
        const nameA = getDisplayName(a.userId).toLowerCase();
        const nameB = getDisplayName(b.userId).toLowerCase();
        return nameA.localeCompare(nameB, 'tr');
    });

    employeeList.innerHTML = sortedUsers.map(user => {
        const isSelected = selectedMembers.some(m => m.userId === user.userId);
        const displayName = getDisplayName(user.userId);

        return `
            <div class="employee-checkbox-item ${isSelected ? 'selected' : ''}" data-user-id="${user.userId}">
                <input type="checkbox"
                       id="emp-${user.userId}"
                       value="${user.userId}"
                       ${isSelected ? 'checked' : ''}
                       data-user-name="${escapeHtml(displayName)}">
                <label for="emp-${user.userId}">${escapeHtml(displayName)}</label>
            </div>
        `;
    }).join('');

    // Add event delegation for checkboxes
    employeeList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            handleEmployeeSelection(this);
        });
    });

    // Add click handler for the entire item (excluding checkbox and label)
    employeeList.querySelectorAll('.employee-checkbox-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Only toggle if clicking the item itself, not the checkbox or label
            if (e.target === this) {
                const checkbox = this.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    handleEmployeeSelection(checkbox);
                }
            }
        });
    });

    // Update selected count
    updateSelectedCount();
}

// Toggle employee checkbox when clicking the entire item
function toggleEmployeeCheckbox(userId) {
    const checkbox = document.getElementById(`emp-${userId}`);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        handleEmployeeSelection(checkbox);
    }
}

// Handle employee checkbox selection
function handleEmployeeSelection(checkbox) {
    const item = checkbox.closest('.employee-checkbox-item');
    if (checkbox.checked) {
        item.classList.add('selected');
    } else {
        item.classList.remove('selected');
    }

    // Update selected count
    updateSelectedCount();
}

// Update selected employees count
function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('#employee-list input[type="checkbox"]:checked');
    const selectedCount = document.getElementById('selected-count');

    if (selectedCount) {
        selectedCount.textContent = `${checkboxes.length} çalışan seçildi`;
    }
}

// Filter employee list
function filterEmployeeList(searchTerm) {
    const normalizedSearch = normalizeForTurkishSearch(searchTerm);
    const items = document.querySelectorAll('.employee-checkbox-item');

    items.forEach(item => {
        const userId = item.getAttribute('data-user-id');
        const displayName = getDisplayName(userId);
        const normalizedText = normalizeForTurkishSearch(displayName);

        if (normalizedText.includes(normalizedSearch)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Save team (create or update)
function saveTeam() {
    const teamName = document.getElementById('team-name').value.trim();

    if (!teamName) {
        turkishAlert('Lütfen ekip adını girin.');
        return;
    }

    // Get selected members
    const checkboxes = document.querySelectorAll('#employee-list input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        turkishAlert('Lütfen en az bir çalışan seçin.');
        return;
    }

    const members = Array.from(checkboxes).map(cb => {
        // Preserve existing titles if editing, otherwise empty
        let existingTitle = '';
        if (currentEditingTeam && currentEditingTeam.members) {
            const existing = currentEditingTeam.members.find(m => m.userId === cb.value);
            if (existing) {
                existingTitle = existing.title || '';
            }
        }

        return {
            userId: cb.value,
            name: cb.dataset.userName,
            title: existingTitle
        };
    });

    if (currentEditingTeam) {
        // Update existing team
        const teamIndex = teamsData.findIndex(t => t.id === currentEditingTeam.id);
        if (teamIndex !== -1) {
            teamsData[teamIndex] = {
                ...teamsData[teamIndex],
                name: teamName,
                members: members,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new team
        const newTeam = {
            id: 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: teamName,
            members: members,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        teamsData.push(newTeam);
    }

    // Save to localStorage
    saveTeams(teamsData);

    // Refresh display
    filteredTeamsData = [...teamsData];
    renderTeamsGrid();

    // Close modal
    closeTeamModal();

    // Show success message
    turkishAlert(currentEditingTeam ? 'Ekip başarıyla güncellendi.' : 'Ekip başarıyla oluşturuldu.');
}

// View team details
function viewTeamDetails(teamId) {
    const team = teamsData.find(t => t.id === teamId);
    if (!team) return;

    currentEditingTeam = team;

    const modal = document.getElementById('view-team-modal');
    document.getElementById('view-team-name').textContent = team.name;
    document.getElementById('view-team-member-count').textContent = team.members.length;
    document.getElementById('view-team-created-date').textContent = formatDateTurkish(new Date(team.createdAt));

    // Render team members in list format
    const membersList = document.getElementById('view-team-members');
    if (membersList) {
        membersList.innerHTML = team.members.map(member => {
            const displayName = getDisplayName(member.userId);
            return `
                <div class="team-member-item">
                    <div class="team-member-info">
                        <div class="team-member-name">${escapeHtml(displayName)}</div>
                        ${member.title ? `<div class="team-member-title">${escapeHtml(member.title)}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    if (modal) modal.classList.add('show');
}

// Close view team modal
function closeViewTeamModal() {
    const modal = document.getElementById('view-team-modal');
    if (modal) modal.classList.remove('show');
}

// Show delete team confirmation modal
function showDeleteTeamModal(teamId, teamName) {
    const modal = document.getElementById('delete-team-modal');
    document.getElementById('delete-team-name').textContent = teamName;
    modal.dataset.teamId = teamId;
    modal.classList.add('show');

    // Close view modal
    closeViewTeamModal();
}

// Close delete team modal
function closeDeleteTeamModal() {
    const modal = document.getElementById('delete-team-modal');
    if (modal) {
        modal.classList.remove('show');
        delete modal.dataset.teamId;
    }
}

// Confirm delete team
function confirmDeleteTeam() {
    const modal = document.getElementById('delete-team-modal');
    const teamId = modal.dataset.teamId;

    if (!teamId) return;

    // Remove team from array
    teamsData = teamsData.filter(t => t.id !== teamId);

    // Save to localStorage
    saveTeams(teamsData);

    // Refresh display
    filteredTeamsData = [...teamsData];
    renderTeamsGrid();

    // Close modal
    closeDeleteTeamModal();

    // Show success message
    turkishAlert('Ekip başarıyla silindi.');
}
// ========================================
// Username Mapping Functions
// ========================================

let currentEditingPCName = null;
let activeDropdownId = null;

/**
 * Toggle actions dropdown menu
 */
function toggleActionsMenu(userId, pcName, displayName) {
    const dropdownId = `actions-dropdown-${userId}`;
    const dropdown = document.getElementById(dropdownId);
    const button = dropdown.previousElementSibling;
    
    // Close any other open dropdowns
    if (activeDropdownId && activeDropdownId !== dropdownId) {
        const prevDropdown = document.getElementById(activeDropdownId);
        const prevButton = prevDropdown?.previousElementSibling;
        if (prevDropdown) {
            prevDropdown.classList.remove('show');
            prevButton?.classList.remove('active');
        }
    }
    
    // Toggle current dropdown
    const isOpen = dropdown.classList.toggle('show');
    button.classList.toggle('active', isOpen);
    
    activeDropdownId = isOpen ? dropdownId : null;
}

/**
 * Close all dropdowns when clicking outside
 */
document.addEventListener('click', function(event) {
    if (!event.target.closest('.actions-menu-btn') && !event.target.closest('.actions-dropdown')) {
        if (activeDropdownId) {
            const dropdown = document.getElementById(activeDropdownId);
            const button = dropdown?.previousElementSibling;
            if (dropdown) {
                dropdown.classList.remove('show');
                button?.classList.remove('active');
            }
            activeDropdownId = null;
        }
    }
});

/**
 * Open edit username modal
 */
function openEditUsernameModal(pcName, currentDisplayName) {
    currentEditingPCName = pcName;
    
    const modal = document.getElementById('edit-username-modal');
    const pcNameSpan = document.getElementById('edit-modal-pc-name');
    const input = document.getElementById('custom-username-input');
    
    pcNameSpan.textContent = pcName;
    
    // If already has custom name, show it; otherwise show PC name
    const hasCustomName = window.userNameMapping.hasMapping(pcName);
    input.value = hasCustomName ? currentDisplayName : '';
    input.placeholder = hasCustomName ? currentDisplayName : 'Örn: Ahmet Yılmaz';
    
    modal.style.display = 'flex';
    input.focus();
    
    // Close dropdown
    if (activeDropdownId) {
        const dropdown = document.getElementById(activeDropdownId);
        dropdown?.classList.remove('show');
        activeDropdownId = null;
    }
}

/**
 * Close edit username modal
 */
function closeEditUsernameModal() {
    const modal = document.getElementById('edit-username-modal');
    const form = document.getElementById('edit-username-form');
    
    modal.style.display = 'none';
    form.reset();
    currentEditingPCName = null;
}

/**
 * Save username mapping
 */
function saveUsername(event) {
    event.preventDefault();
    
    if (!currentEditingPCName) {
        console.error('[Username] No PC name set for editing');
        return;
    }
    
    const input = document.getElementById('custom-username-input');
    const customName = input.value.trim();
    
    if (!customName) {
        turkishAlert('Lütfen bir kullanıcı adı giriniz');
        return;
    }
    
    // Save mapping
    const success = window.userNameMapping.setDisplayName(currentEditingPCName, customName);
    
    if (success) {

        // Refresh the table and charts
        updateUserTable();
        createCharts();

        // Refresh Çalışanlar page if it exists
        if (typeof renderCalisanlarTable === 'function') {
            renderCalisanlarTable();
        }

        // Close modal
        closeEditUsernameModal();

        // Show success message
        turkishAlert(`Kullanıcı adı başarıyla güncellendi: ${customName}`);
    } else {
        turkishAlert('Kullanıcı adı kaydedilemedi');
    }
}

/**
 * Delete username mapping
 */
function deleteUserMapping(pcName) {
    if (!pcName) return;
    
    const hasMapping = window.userNameMapping.hasMapping(pcName);
    
    if (!hasMapping) {
        turkishAlert('Bu kullanıcı için özel ad bulunmuyor');
        return;
    }
    
    const customName = window.userNameMapping.getDisplayName(pcName);
    
    // Confirm deletion
    if (confirm(`"${customName}" adını silmek istediğinizden emin misiniz?\n\nKullanıcı "${pcName}" olarak görünecektir.`)) {
        const success = window.userNameMapping.removeMapping(pcName);
        
        if (success) {

            // Refresh the table and charts
            updateUserTable();
            createCharts();

            // Refresh Çalışanlar page if it exists
            if (typeof renderCalisanlarTable === 'function') {
                renderCalisanlarTable();
            }

            // Close dropdown
            if (activeDropdownId) {
                const dropdown = document.getElementById(activeDropdownId);
                dropdown?.classList.remove('show');
                activeDropdownId = null;
            }

            // Show success message
            turkishAlert('Özel kullanıcı adı silindi');
        } else {
            turkishAlert('Kullanıcı adı silinemedi');
        }
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('edit-username-modal');
    if (event.target === modal) {
        closeEditUsernameModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('edit-username-modal');
        if (modal && modal.style.display === 'flex') {
            closeEditUsernameModal();
        }
    }
});

