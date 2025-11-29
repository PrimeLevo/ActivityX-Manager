// Reports Page JavaScript

let selectedUsers = [];
let selectedTeams = [];
let reportHistory = [];
let currentReportData = null;

// Date selection variables
let reportStartDate = null;
let reportEndDate = null;
let reportStartCalendar = null;
let reportEndCalendar = null;

// Filter out system apps that should not be displayed in reports
function shouldFilterApp(appName) {
    if (!appName) return true;
    const lowerName = appName.toLowerCase();
    return lowerName === 'lockapp' || lowerName === 'lock app';
}

// Turkish month names for custom calendar
const turkishMonths = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Turkish day names (Sunday = 0, Monday = 1, etc.)
const turkishDays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

// Get Turkish day name from date
function getTurkishDayName(date) {
    return turkishDays[date.getDay()];
}

// Format date in Turkish
function formatDateTurkish(date) {
    const day = date.getDate();
    const month = turkishMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Use the STORAGE_KEY from app.js
const getStorageKey = () => {
    return window.STORAGE_KEY || 'kta_persisted_users_v1';
};

// Initialize reports page
function initReportsPage() {
    // Small delay to ensure DOM is fully loaded
    setTimeout(() => {
        loadReportHistory();
        setupEventListeners();
        populateUsersList();
        populateTeamsList();
        updateHistoryDisplay();
        initializeTurkishCalendars();
    }, 100);
}

// Initialize Turkish calendars for date selection
function initializeTurkishCalendars() {
    // No default dates - user must select them
    window.reportStartDate = null;
    window.reportEndDate = null;

    reportStartDate = null;
    reportEndDate = null;

    // Create Turkish calendars (they will be initialized when modal opens)
}

// Initialize date inputs with max date (today)
function initializeDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    if (startDateInput) {
        startDateInput.max = today;
    }
    if (endDateInput) {
        endDateInput.max = today;
    }
}

// Clear date inputs (no default dates - user must select)
function setDefaultDateRange() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    // Clear any existing values - user must select dates
    if (startDateInput) {
        startDateInput.value = '';
    }
    if (endDateInput) {
        endDateInput.value = '';
    }

    // Update the info display to show dates need to be selected
    updateDateRangeInfo();
}

// Setup all event listeners
function setupEventListeners() {
    // Open report generation modal
    const openModalBtn = document.getElementById('open-report-modal-btn');
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            if (window.openReportGenerationModal) {
                window.openReportGenerationModal();
            }
        });
    }

    // Close report generation modal
    const closeGenerationModal = document.getElementById('close-generation-modal');
    const cancelReportBtn = document.getElementById('cancel-report-generation');
    if (closeGenerationModal) {
        closeGenerationModal.addEventListener('click', () => {
            if (window.closeReportGenerationModal) {
                window.closeReportGenerationModal();
            }
        });
    }
    if (cancelReportBtn) {
        cancelReportBtn.addEventListener('click', () => {
            if (window.closeReportGenerationModal) {
                window.closeReportGenerationModal();
            }
        });
    }

    // User selection type buttons
    const selectionButtons = document.querySelectorAll('.selection-btn');
    selectionButtons.forEach(btn => {
        btn.addEventListener('click', handleSelectionTypeClick);
    });

    // User search
    const usersSearch = document.getElementById('users-search');
    if (usersSearch) {
        usersSearch.addEventListener('input', handleUserSearch);
    }

    // Select all / Clear all buttons
    const selectAllBtn = document.getElementById('select-all-users');
    const clearAllBtn = document.getElementById('clear-all-users');
    if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllUsers);
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllUsers);

    // Team selection - multiple teams
    const teamsSearch = document.getElementById('teams-search');
    if (teamsSearch) {
        teamsSearch.addEventListener('input', handleTeamSearch);
    }

    const selectAllTeamsBtn = document.getElementById('select-all-teams');
    const clearAllTeamsBtn = document.getElementById('clear-all-teams');
    if (selectAllTeamsBtn) selectAllTeamsBtn.addEventListener('click', selectAllTeams);
    if (clearAllTeamsBtn) clearAllTeamsBtn.addEventListener('click', clearAllTeams);

    // Generate report button
    const generateBtn = document.getElementById('generate-report-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateReport);
    }

    // Clear history button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', showClearHistoryModal);
    }

    // Modal controls
    const closePreviewBtn = document.getElementById('close-preview');
    if (closePreviewBtn) {
        closePreviewBtn.addEventListener('click', closeReportPreview);
    }

    const downloadCsvBtn = document.getElementById('download-csv-btn');
    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener('click', downloadCurrentReportAsCSV);
    }

    const cancelClearHistory = document.getElementById('cancel-clear-history');
    const confirmClearHistory = document.getElementById('confirm-clear-history');
    if (cancelClearHistory) {
        cancelClearHistory.addEventListener('click', hideClearHistoryModal);
    }
    if (confirmClearHistory) {
        confirmClearHistory.addEventListener('click', clearReportHistory);
    }

    // Report content option checkboxes - make entire div clickable
    setupReportContentOptions();
}

// Setup report content option click handlers
function setupReportContentOptions() {
    const checkboxOptions = document.querySelectorAll('.report-content-options .checkbox-option');
    checkboxOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            // Only toggle if we didn't click directly on the checkbox
            if (e.target.type !== 'checkbox') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
            }
        });
    });
}

// Handle date preset button clicks
function handleDatePresetClick(e) {
    const range = e.target.dataset.range;
    const dateRange = calculatePresetDateRange(range);

    if (!dateRange) return;

    // Populate the date inputs
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    if (startDateInput) {
        startDateInput.value = dateRange.startDate.toISOString().split('T')[0];
    }
    if (endDateInput) {
        endDateInput.value = dateRange.endDate.toISOString().split('T')[0];
    }

    // Highlight the clicked button temporarily
    e.target.classList.add('active');
    setTimeout(() => {
        e.target.classList.remove('active');
    }, 300);

    updateDateRangeInfo();
}

// Calculate date range for presets
function calculatePresetDateRange(range) {
    const now = new Date();
    let startDate, endDate;

    switch (range) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
            endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
            break;
        case 'last7days':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 6);
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'last30days':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 29);
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'thisweek':
            const currentDay = now.getDay();
            const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
            startDate = new Date(now);
            startDate.setDate(now.getDate() - daysToMonday);
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'thismonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'lastmonth':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        default:
            return null;
    }

    return { startDate, endDate };
}

// Update date range info display
function updateDateRangeInfo() {
    const dateRangeText = document.getElementById('date-range-text');
    if (!dateRangeText) return;

    const startInput = document.getElementById('start-date');
    const endInput = document.getElementById('end-date');

    if (!startInput?.value || !endInput?.value) {
        dateRangeText.textContent = 'Lütfen başlangıç ve bitiş tarihlerini seçin';
        return;
    }

    const startDate = new Date(startInput.value);
    const endDate = new Date(endInput.value);

    // Validate dates
    if (startDate > endDate) {
        dateRangeText.innerHTML = '<span style="color: #dc3545;">⚠ Başlangıç tarihi bitiş tarihinden sonra olamaz</span>';
        return;
    }

    // Normalize dates to midnight for accurate day count calculation
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    const normalizedEnd = new Date(endDate);
    normalizedEnd.setHours(0, 0, 0, 0);

    const dayCount = Math.ceil((normalizedEnd - normalizedStart) / (1000 * 60 * 60 * 24)) + 1;
    const infoText = `${formatDateTurkish(startDate)} - ${formatDateTurkish(endDate)} (${dayCount} gün)`;

    dateRangeText.textContent = infoText;
}

// Handle user selection type clicks
function handleSelectionTypeClick(e) {
    // Remove active class from all selection buttons
    document.querySelectorAll('.selection-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to clicked button
    e.target.classList.add('active');

    const selectionType = e.target.dataset.selection;
    const specificUsersContainer = document.getElementById('specific-users-container');
    const teamSelectionContainer = document.getElementById('team-selection-container');

    // Clear previous selections when switching modes
    // Clear specific users selection
    selectedUsers = [];
    const userCheckboxes = document.querySelectorAll('#users-list input[type="checkbox"]');
    userCheckboxes.forEach(cb => cb.checked = false);
    updateSelectedUsersCount();

    // Clear team selection
    selectedTeams = [];
    const teamCheckboxes = document.querySelectorAll('#teams-list input[type="checkbox"]');
    teamCheckboxes.forEach(cb => cb.checked = false);
    updateSelectedTeamsCount();
    updateSelectedTeamMembers(); // Also hide the team members display

    // Hide all containers first
    specificUsersContainer.style.display = 'none';
    teamSelectionContainer.style.display = 'none';

    // Show relevant container
    if (selectionType === 'specific') {
        specificUsersContainer.style.display = 'block';
    } else if (selectionType === 'team') {
        teamSelectionContainer.style.display = 'block';
    }
}

// Populate users list from localStorage
function populateUsersList() {
    const usersList = document.getElementById('users-list');
    if (!usersList) return;

    // Get persisted users from localStorage
    const persistedUsers = JSON.parse(localStorage.getItem(getStorageKey()) || '[]');

    // Extract unique user identifiers
    const allUsers = persistedUsers
        .map(user => user.pcName || user.username || user.userId)
        .filter(user => user); // Remove any undefined/null values

    // Remove duplicates
    const uniqueUsers = [...new Set(allUsers)];

    // Sort users alphabetically by display name
    uniqueUsers.sort((a, b) => {
        const displayNameA = window.getDisplayName ? window.getDisplayName(a) : a;
        const displayNameB = window.getDisplayName ? window.getDisplayName(b) : b;
        return displayNameA.localeCompare(displayNameB, 'tr');
    });

    usersList.innerHTML = '';

    if (uniqueUsers.length === 0) {
        usersList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">Kullanıcı bulunamadı</div>';
        return;
    }

    uniqueUsers.forEach(user => {
        const displayName = window.getDisplayName ? window.getDisplayName(user) : user;
        const userItem = document.createElement('div');
        userItem.className = 'checkbox-option user-checkbox-item';
        userItem.innerHTML = `
            <input type="checkbox" id="user-${user}" value="${user}">
            <label>${displayName}</label>
        `;

        const checkbox = userItem.querySelector('input');
        checkbox.addEventListener('change', handleUserCheckboxChange);

        // Make the entire item clickable (excluding direct checkbox clicks)
        userItem.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        usersList.appendChild(userItem);
    });
}

// Handle user search
function handleUserSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const userItems = document.querySelectorAll('.user-checkbox-item');

    userItems.forEach(item => {
        const label = item.querySelector('label').textContent.toLowerCase();
        if (label.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Handle user checkbox change
function handleUserCheckboxChange(e) {
    if (e.target.checked) {
        if (!selectedUsers.includes(e.target.value)) {
            selectedUsers.push(e.target.value);
        }
    } else {
        selectedUsers = selectedUsers.filter(user => user !== e.target.value);
    }

    updateSelectedUsersCount();
}

// Update selected users count
function updateSelectedUsersCount() {
    const countElement = document.getElementById('selected-users-count');
    if (countElement) {
        countElement.textContent = `${selectedUsers.length} kullanıcı seçildi`;
    }
}

// Select all users
function selectAllUsers() {
    const checkboxes = document.querySelectorAll('#users-list input[type="checkbox"]');
    selectedUsers = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.parentElement.style.display !== 'none') {
            checkbox.checked = true;
            selectedUsers.push(checkbox.value);
        }
    });

    updateSelectedUsersCount();
}

// Clear all users
function clearAllUsers() {
    const checkboxes = document.querySelectorAll('#users-list input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    selectedUsers = [];
    updateSelectedUsersCount();
}

// Populate teams list with checkboxes for multiple selection
function populateTeamsList() {
    const teamsList = document.getElementById('teams-list');
    if (!teamsList) return;

    // Get teams from localStorage using the correct key
    const TEAMS_STORAGE_KEY = 'kta_teams_v1';
    const teams = JSON.parse(localStorage.getItem(TEAMS_STORAGE_KEY) || '[]');

    teamsList.innerHTML = '';

    if (teams.length === 0) {
        teamsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">Henüz ekip oluşturulmamış</div>';
        return;
    }

    // Sort teams alphabetically
    teams.sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    teams.forEach(team => {
        const memberCount = team.members ? team.members.length : 0;
        const teamItem = document.createElement('div');
        teamItem.className = 'checkbox-option team-checkbox-item';
        teamItem.innerHTML = `
            <input type="checkbox" id="team-${team.id}" value="${team.id}">
            <label>${team.name} <span class="team-member-badge">(${memberCount} üye)</span></label>
        `;

        const checkbox = teamItem.querySelector('input');
        checkbox.addEventListener('change', handleTeamCheckboxChange);

        // Make the entire item clickable (excluding direct checkbox clicks)
        teamItem.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        teamsList.appendChild(teamItem);
    });
}

// Handle team checkbox change
function handleTeamCheckboxChange(e) {
    const teamId = e.target.value;

    if (e.target.checked) {
        if (!selectedTeams.includes(teamId)) {
            selectedTeams.push(teamId);
        }
    } else {
        selectedTeams = selectedTeams.filter(id => id !== teamId);
    }

    updateSelectedTeamsCount();
    updateSelectedTeamMembers();
}

// Update selected teams count
function updateSelectedTeamsCount() {
    const countElement = document.getElementById('selected-teams-count');
    if (countElement) {
        countElement.textContent = `${selectedTeams.length} ekip seçildi`;
    }
}

// Update selected team members display
function updateSelectedTeamMembers() {
    const membersInfo = document.getElementById('team-members-info');
    const membersList = document.getElementById('selected-team-members');

    if (!membersInfo || !membersList) return;

    if (selectedTeams.length === 0) {
        membersInfo.style.display = 'none';
        return;
    }

    const TEAMS_STORAGE_KEY = 'kta_teams_v1';
    const teams = JSON.parse(localStorage.getItem(TEAMS_STORAGE_KEY) || '[]');

    // Collect all unique members from selected teams
    const allMembers = new Set();
    selectedTeams.forEach(teamId => {
        const team = teams.find(t => t.id === teamId);
        if (team && team.members) {
            team.members.forEach(member => {
                const userId = member.userId || member;
                allMembers.add(userId);
            });
        }
    });

    // Get display names and sort
    const memberNames = Array.from(allMembers).map(userId => {
        return window.getDisplayName ? window.getDisplayName(userId) : userId;
    }).sort((a, b) => a.localeCompare(b, 'tr'));

    membersInfo.style.display = 'block';
    membersList.innerHTML = memberNames.map(name => `<div class="team-member-item">${name}</div>`).join('');
}

// Handle team search
function handleTeamSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const teamItems = document.querySelectorAll('.team-checkbox-item');

    teamItems.forEach(item => {
        const label = item.querySelector('label').textContent.toLowerCase();
        if (label.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Select all teams
function selectAllTeams() {
    const checkboxes = document.querySelectorAll('#teams-list input[type="checkbox"]');
    selectedTeams = [];

    checkboxes.forEach(checkbox => {
        if (checkbox.parentElement.style.display !== 'none') {
            checkbox.checked = true;
            selectedTeams.push(checkbox.value);
        }
    });

    updateSelectedTeamsCount();
    updateSelectedTeamMembers();
}

// Clear all teams
function clearAllTeams() {
    const checkboxes = document.querySelectorAll('#teams-list input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    selectedTeams = [];
    updateSelectedTeamsCount();
    updateSelectedTeamMembers();
}

// Legacy function - kept for compatibility but no longer used
function handleTeamSelection(e) {
    const teamId = e.target.value;
    const teamInfo = document.getElementById('team-info');

    if (teamId) {
        const TEAMS_STORAGE_KEY = 'kta_teams_v1';
        const teams = JSON.parse(localStorage.getItem(TEAMS_STORAGE_KEY) || '[]');
        const team = teams.find(t => t.id === teamId);

        if (team) {
            selectedTeams = [teamId];
            if (teamInfo) teamInfo.style.display = 'block';

            // Get display names for all team members
            const memberNames = team.members.map(member => {
                // member is an object with userId property
                const userId = member.userId || member;
                return window.getDisplayName ? window.getDisplayName(userId) : userId;
            });

            // Create HTML for team member list
            const memberCount = team.members.length;
            const memberListHTML = memberNames.map(name => `<div class="team-member-item">${name}</div>`).join('');

            if (teamInfo) {
                teamInfo.innerHTML = `
                    <div class="team-member-count">${memberCount} üye:</div>
                    <div class="team-members-list">${memberListHTML}</div>
                `;
            }
        }
    } else {
        selectedTeams = [];
        teamInfo.style.display = 'none';
    }
}

// Get date range from date inputs
function getDateRange() {
    const startInput = document.getElementById('start-date').value;
    const endInput = document.getElementById('end-date').value;

    if (!startInput || !endInput) {
        return null;
    }

    const startDate = new Date(startInput);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(endInput);
    endDate.setHours(23, 59, 59, 999);

    // Validate
    if (startDate > endDate) {
        return null;
    }

    return { startDate, endDate };
}

// Get selected users based on selection type
function getSelectedUsersList() {
    const selectionType = document.querySelector('.selection-btn.active').dataset.selection;
    const persistedUsers = JSON.parse(localStorage.getItem(getStorageKey()) || '[]');

    switch (selectionType) {
        case 'all':
            // Include userId as fallback, and filter out any undefined/null values
            // Use Set to ensure no duplicates
            return [...new Set(persistedUsers
                .map(user => user.pcName || user.username || user.userId)
                .filter(user => user))]; // Remove any undefined/null values
        case 'specific':
            // Use Set to ensure no duplicates
            return [...new Set(selectedUsers)];
        case 'team':
            if (selectedTeams.length > 0) {
                const TEAMS_STORAGE_KEY = 'kta_teams_v1';
                const teams = JSON.parse(localStorage.getItem(TEAMS_STORAGE_KEY) || '[]');

                // Collect all unique members from selected teams
                const allMembers = new Set();
                selectedTeams.forEach(teamId => {
                    const team = teams.find(t => t.id === teamId);
                    if (team && team.members) {
                        team.members.forEach(member => {
                            const userId = member.userId || member;
                            allMembers.add(userId);
                        });
                    }
                });

                return Array.from(allMembers);
            }
            return [];
        default:
            return [];
    }
}

// Generate report
async function generateReport() {
    // Check if dates are selected (using calendar variables)
    if (!window.reportStartDate || !window.reportEndDate) {
        turkishAlert('Lütfen başlangıç ve bitiş tarihlerini seçin.');
        return;
    }

    // Get date range from modal
    const dateRange = window.getReportDateRange ? window.getReportDateRange() : null;
    if (!dateRange) {
        turkishAlert('Geçersiz tarih aralığı. Başlangıç tarihi bitiş tarihinden önce olmalıdır.');
        return;
    }

    // Get selected users
    const users = getSelectedUsersList();
    if (users.length === 0) {
        turkishAlert('Lütfen en az bir kullanıcı seçin.');
        return;
    }

    // Get report content options
    const includeApps = document.getElementById('include-apps')?.checked ?? true;
    const includeWebsites = document.getElementById('include-websites')?.checked ?? true;
    const includeDailyBreakdown = document.getElementById('include-daily-breakdown')?.checked ?? false;

    // Close the generation modal
    if (window.closeReportGenerationModal) {
        window.closeReportGenerationModal();
    }

    // Show loading
    showLoadingPopup('Rapor oluşturuluyor...');

    try {
        // Get persisted users data
        const persistedUsers = JSON.parse(localStorage.getItem(getStorageKey()) || '[]');

        if (persistedUsers.length === 0) {
            hideLoadingPopup();
            turkishAlert('Veri bulunamadı. Lütfen önce Supabase\'den veri çekin.');
            return;
        }

        // Process data for selected users and date range with user-selected options
        const reportData = processReportData(persistedUsers, users, dateRange, {
            includeApps: includeApps,
            includeWebsites: includeWebsites,
            includeDailyBreakdown: includeDailyBreakdown,
            includeTimeline: true,
            includeSummary: true
        });

        // Check if report has any data
        if (reportData.data.userDetails.length === 0) {
            hideLoadingPopup();
            turkishAlert('Seçilen tarih aralığında ve kullanıcılar için veri bulunamadı.');
            return;
        }

        // Store current report data
        currentReportData = reportData;

        // Add to history
        addToReportHistory(reportData);

        // Hide loading
        hideLoadingPopup();

        // Download CSV directly instead of showing preview
        downloadReportAsCSV(reportData);
    } catch (error) {
        console.error('Error generating report:', error);
        hideLoadingPopup();
        turkishAlert('Rapor oluşturulurken bir hata oluştu: ' + error.message);
    }
}

// Process report data
function processReportData(persistedUsers, userNames, dateRange, options) {

    const report = {
        id: Date.now().toString(),
        createdAt: new Date(),
        dateRange: {
            start: dateRange.startDate,
            end: dateRange.endDate
        },
        users: userNames,
        options: options,
        data: {
            summary: {},
            applications: {},
            websites: {},
            timeline: [],
            userDetails: [],
            dailyData: {} // New: daily breakdown data { 'YYYY-MM-DD': { users: { userName: { activeTime, apps, websites } }, totalActiveTime } }
        }
    };

    let totalActiveTime = 0;
    let totalApps = new Set();
    let totalWebsites = new Set();

    // Process each user
    userNames.forEach(userName => {
        // Find the user data in persistedUsers
        const userData = persistedUsers.find(u => (u.pcName || u.username || u.userId) === userName);

        if (!userData) {
            return;
        }

        let userActiveTime = 0;
        const userApps = {};
        const userWebsites = {};
        let batchesInRange = 0;
        const userDailyData = {}; // Track daily data for this user

        // Process batch data - batches are stored in batchIds array
        if (userData.batchIds && Array.isArray(userData.batchIds)) {
            if (userData.batchIds.length > 0) {
                const firstBatch = userData.batchIds[0];
            }

            userData.batchIds.forEach(batch => {
                // Combine date and time fields to create proper datetime
                const dateStr = batch.date_tracked || batch.d;
                const timeStr = batch.batch_start_time || batch.s;

                // Create datetime string in ISO format
                const batchDate = new Date(`${dateStr}T${timeStr}`);

                // Skip if date is invalid
                if (isNaN(batchDate.getTime())) {
                    return;
                }

                // Check if batch is in date range
                if (batchDate >= dateRange.startDate && batchDate <= dateRange.endDate) {
                    batchesInRange++;

                    // Get the date key for daily breakdown (YYYY-MM-DD format)
                    const dayKey = dateStr;

                    // Initialize daily data structure for this day if needed
                    if (options.includeDailyBreakdown) {
                        if (!userDailyData[dayKey]) {
                            userDailyData[dayKey] = {
                                activeTime: 0,
                                apps: {},
                                websites: {}
                            };
                        }
                    }

                    // Add active time from batch (using short field names: at = active time)
                    const batchActiveTime = batch.at || batch.total_active_seconds || batch.active_time_seconds || 0;

                    userActiveTime += batchActiveTime;

                    // Add to daily data
                    if (options.includeDailyBreakdown && userDailyData[dayKey]) {
                        userDailyData[dayKey].activeTime += batchActiveTime;
                    }

                    // Process applications from batch (using short field name: ap = applications)
                    // Always collect app data for counting and daily breakdown
                    if (batch.ap) {
                        const apps = batch.ap;

                        if (Array.isArray(apps)) {
                            apps.forEach(appItem => {
                                const appName = appItem.name || appItem.app_name || 'Unknown';
                                // Skip system apps like LockApp
                                if (shouldFilterApp(appName)) return;
                                // Ensure time is converted to number
                                const appTime = Number(appItem.usage || appItem.time || appItem.active_seconds || 0);
                                // Always collect for counting
                                userApps[appName] = (userApps[appName] || 0) + appTime;
                                totalApps.add(appName);
                                // Add to daily data
                                if (options.includeDailyBreakdown && userDailyData[dayKey]) {
                                    userDailyData[dayKey].apps[appName] = (userDailyData[dayKey].apps[appName] || 0) + appTime;
                                }
                            });
                        } else if (typeof apps === 'object') {
                            // Handle object format: {appName: time, ...}
                            Object.entries(apps).forEach(([app, time]) => {
                                // Skip system apps like LockApp
                                if (shouldFilterApp(app)) return;
                                // Ensure time is converted to number
                                const numTime = Number(time) || 0;
                                // Always collect for counting
                                userApps[app] = (userApps[app] || 0) + numTime;
                                totalApps.add(app);
                                // Add to daily data
                                if (options.includeDailyBreakdown && userDailyData[dayKey]) {
                                    userDailyData[dayKey].apps[app] = (userDailyData[dayKey].apps[app] || 0) + numTime;
                                }
                            });
                        }
                    }

                    // Process websites from batch (using short field name: ur = URLs/websites)
                    // Always collect website data for counting and daily breakdown
                    if (batch.ur) {
                        const sites = batch.ur;

                        if (Array.isArray(sites)) {
                            sites.forEach(siteItem => {
                                const siteName = siteItem.url || siteItem.name || 'Unknown';
                                const cleanSite = window.cleanWebsiteName ?
                                    window.cleanWebsiteName(siteName) : siteName;
                                // Extract time from 't' field (short field name) or 'time' field
                                const siteTime = Number(siteItem.t || siteItem.time || siteItem.usage || siteItem.active_seconds || 0);

                                // Always collect for counting
                                userWebsites[cleanSite] = (userWebsites[cleanSite] || 0) + siteTime;
                                totalWebsites.add(cleanSite);
                                // Add to daily data
                                if (options.includeDailyBreakdown && userDailyData[dayKey]) {
                                    userDailyData[dayKey].websites[cleanSite] = (userDailyData[dayKey].websites[cleanSite] || 0) + siteTime;
                                }
                            });
                        } else if (typeof sites === 'object') {
                            // Handle object format: {siteName: {t: time, ti: title}, ...}
                            Object.entries(sites).forEach(([site, siteData]) => {
                                const cleanSite = window.cleanWebsiteName ?
                                    window.cleanWebsiteName(site) : site;
                                // Extract time from 't' field (short field name) or 'time' field
                                // siteData can be either an object {t: time, ti: title} or just a number
                                const numTime = typeof siteData === 'object' ?
                                    Number(siteData.t || siteData.time || 0) :
                                    Number(siteData || 0);

                                // Always collect for counting
                                userWebsites[cleanSite] = (userWebsites[cleanSite] || 0) + numTime;
                                totalWebsites.add(cleanSite);
                                // Add to daily data
                                if (options.includeDailyBreakdown && userDailyData[dayKey]) {
                                    userDailyData[dayKey].websites[cleanSite] = (userDailyData[dayKey].websites[cleanSite] || 0) + numTime;
                                }
                            });
                        }
                    }
                }
            });
        }


        // Add user details to report only if they have data in the range
        if (batchesInRange > 0 || userActiveTime > 0) {
            const displayName = window.getDisplayName ? window.getDisplayName(userName) : userName;
            report.data.userDetails.push({
                name: userName,
                displayName: displayName,
                activeTime: userActiveTime,
                applications: userApps,
                websites: userWebsites,
                batchCount: batchesInRange,
                dailyData: options.includeDailyBreakdown ? userDailyData : null
            });

            totalActiveTime += userActiveTime;

            // Aggregate application data
            Object.entries(userApps).forEach(([app, time]) => {
                report.data.applications[app] = (report.data.applications[app] || 0) + time;
            });

            // Aggregate website data
            Object.entries(userWebsites).forEach(([site, time]) => {
                report.data.websites[site] = (report.data.websites[site] || 0) + time;
            });

            // Aggregate daily data into report.data.dailyData
            if (options.includeDailyBreakdown) {
                Object.entries(userDailyData).forEach(([dayKey, dayData]) => {
                    if (!report.data.dailyData[dayKey]) {
                        report.data.dailyData[dayKey] = {
                            totalActiveTime: 0,
                            users: {}
                        };
                    }
                    report.data.dailyData[dayKey].totalActiveTime += dayData.activeTime;
                    report.data.dailyData[dayKey].users[userName] = {
                        displayName: displayName,
                        activeTime: dayData.activeTime,
                        apps: dayData.apps,
                        websites: dayData.websites
                    };
                });
            }
        }
    });

    // Calculate summary
    if (options.includeSummary) {
        // Normalize dates to midnight for accurate day count calculation
        const normalizedStart = new Date(dateRange.startDate);
        normalizedStart.setHours(0, 0, 0, 0);
        const normalizedEnd = new Date(dateRange.endDate);
        normalizedEnd.setHours(0, 0, 0, 0);

        const dayCount = Math.ceil((normalizedEnd - normalizedStart) / (1000 * 60 * 60 * 24)) + 1;
        const usersWithData = report.data.userDetails.length;

        report.data.summary = {
            totalUsers: usersWithData,
            totalActiveTime: totalActiveTime,
            averageActiveTime: usersWithData > 0 ? totalActiveTime / usersWithData : 0,
            totalApplications: totalApps.size,
            totalWebsites: totalWebsites.size,
            dateRangeInDays: dayCount
        };
    }

    return report;
}

// Show report preview
function showReportPreview(reportData) {
    const modal = document.getElementById('report-preview-modal');
    const content = document.getElementById('report-preview-content');

    // Build preview HTML
    let html = '';

    // Summary section
    if (reportData.options.includeSummary && reportData.data.summary) {
        const summary = reportData.data.summary;
        html += `
            <div class="preview-section">
                <h4>Özet İstatistikler</h4>
                <div class="summary-stats">
                    <div class="stat-card">
                        <div class="stat-label">Toplam Kullanıcı</div>
                        <div class="stat-value">${summary.totalUsers}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Toplam Aktif Süre</div>
                        <div class="stat-value">${formatTime(summary.totalActiveTime)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Ortalama Aktif Süre</div>
                        <div class="stat-value">${formatTime(summary.averageActiveTime)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Uygulama Sayısı</div>
                        <div class="stat-value">${summary.totalApplications}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Web Sitesi Sayısı</div>
                        <div class="stat-value">${summary.totalWebsites}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Gün Sayısı</div>
                        <div class="stat-value">${summary.dateRangeInDays}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // User details section
    if (reportData.data.userDetails && reportData.data.userDetails.length > 0) {
        html += `
            <div class="preview-section">
                <h4>Kullanıcı Detayları</h4>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>Aktif Süre</th>
                            <th>Uygulama Sayısı</th>
                            <th>Web Sitesi Sayısı</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Sort users by active time (descending)
        const sortedUsers = [...reportData.data.userDetails].sort((a, b) => b.activeTime - a.activeTime);

        sortedUsers.forEach((user, index) => {
            const appCount = Object.keys(user.applications || {}).length;
            const webCount = Object.keys(user.websites || {}).length;
            const batchCount = user.batchCount || 0;
            const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';

            html += `
                <tr class="${rowClass}">
                    <td><strong>${user.displayName}</strong></td>
                    <td>${formatTime(user.activeTime)}</td>
                    <td>${appCount}</td>
                    <td>${webCount}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    // Applications section
    if (reportData.options.includeApps && Object.keys(reportData.data.applications).length > 0) {
        const sortedApps = Object.entries(reportData.data.applications)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        html += `
            <div class="preview-section">
                <h4>En Çok Kullanılan Uygulamalar (İlk 20)</h4>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Uygulama</th>
                            <th>Toplam Süre</th>
                            <th>Yüzde</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        const totalAppTime = Object.values(reportData.data.applications)
            .reduce((sum, time) => sum + time, 0);

        sortedApps.forEach(([app, time]) => {
            const percentage = ((time / totalAppTime) * 100).toFixed(1);
            html += `
                <tr>
                    <td>${app}</td>
                    <td>${formatTime(time)}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    // Websites section
    if (reportData.options.includeWebsites && Object.keys(reportData.data.websites).length > 0) {
        const sortedSites = Object.entries(reportData.data.websites)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        html += `
            <div class="preview-section">
                <h4>En Çok Ziyaret Edilen Web Siteleri (İlk 20)</h4>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Web Sitesi</th>
                            <th>Toplam Süre</th>
                            <th>Yüzde</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        const totalWebTime = Object.values(reportData.data.websites)
            .reduce((sum, time) => sum + time, 0);

        sortedSites.forEach(([site, time]) => {
            const percentage = ((time / totalWebTime) * 100).toFixed(1);
            html += `
                <tr>
                    <td>${site}</td>
                    <td>${formatTime(time)}</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;
    }

    // Update preview content
    content.innerHTML = html;

    // Update title with date range using Turkish formatting
    const titleElement = document.getElementById('preview-title');
    const startDate = formatDateTurkish(new Date(reportData.dateRange.start));
    const endDate = formatDateTurkish(new Date(reportData.dateRange.end));
    titleElement.textContent = `Rapor Önizleme (${startDate} - ${endDate})`;

    // Show modal
    modal.style.display = 'flex';
}

// Close report preview
function closeReportPreview() {
    const modal = document.getElementById('report-preview-modal');
    modal.style.display = 'none';
}

// Format time in seconds to readable format
function formatTime(seconds) {
    // Convert to number and handle invalid values
    const numSeconds = Number(seconds);

    // Check for invalid numbers (NaN, null, undefined, etc.)
    if (isNaN(numSeconds) || !isFinite(numSeconds) || numSeconds < 0) {
        return '0 saniye';
    }

    if (numSeconds === 0) return '0 saniye';

    const hours = Math.floor(numSeconds / 3600);
    const minutes = Math.floor((numSeconds % 3600) / 60);
    const secs = Math.floor(numSeconds % 60);

    // If there are hours, show hours and minutes (ignore seconds)
    if (hours > 0) {
        if (minutes > 0) {
            return `${hours} saat ${minutes} dakika`;
        } else {
            return `${hours} saat`;
        }
    }
    // If there are minutes (but no hours), show minutes and seconds
    else if (minutes > 0) {
        if (secs > 0) {
            return `${minutes} dakika ${secs} saniye`;
        } else {
            return `${minutes} dakika`;
        }
    }
    // If only seconds (less than 1 minute), show just seconds
    else {
        return `${secs} saniye`;
    }
}

// Download report as CSV (accepts reportData parameter)
function downloadReportAsCSV(reportData) {
    if (!reportData) return;

    // Header information
    let csv = '=== RAPOR ÖZETİ ===\n';
    csv += `Oluşturma Tarihi,${formatDateTurkish(new Date(reportData.createdAt))}\n`;
    csv += `Rapor Dönemi,${formatDateTurkish(new Date(reportData.dateRange.start))} - ${formatDateTurkish(new Date(reportData.dateRange.end))}\n`;
    csv += `Toplam Gün Sayısı,${reportData.data.summary?.dateRangeInDays || 'N/A'}\n`;
    csv += `Rapor Edilen Kullanıcı Sayısı,${reportData.data.userDetails.length}\n\n`;

    // Summary stats
    if (reportData.data.summary) {
        const s = reportData.data.summary;
        csv += '=== GENEL İSTATİSTİKLER ===\n';
        csv += `Toplam Aktif Süre,${formatTime(s.totalActiveTime)}\n`;
        csv += `Ortalama Kullanıcı Aktif Süresi,${formatTime(s.averageActiveTime)}\n`;
        csv += `Farklı Uygulama Sayısı,${s.totalApplications}\n`;
        csv += `Farklı Web Sitesi Sayısı,${s.totalWebsites}\n\n`;
    }

    // User details with more information
    if (reportData.data.userDetails && reportData.data.userDetails.length > 0) {
        csv += '=== KULLANICI DETAYLARI ===\n';
        csv += 'Sıra,Kullanıcı Adı,Toplam Aktif Süre,Uygulama Sayısı,Web Sitesi Sayısı,Oturum Sayısı\n';

        // Sort users by active time (descending)
        const sortedUsers = [...reportData.data.userDetails].sort((a, b) => b.activeTime - a.activeTime);

        sortedUsers.forEach((user, index) => {
            const appCount = Object.keys(user.applications || {}).length;
            const webCount = Object.keys(user.websites || {}).length;
            const batchCount = user.batchCount || 0;
            csv += `${index + 1},"${user.displayName}",${formatTime(user.activeTime)},${appCount},${webCount},${batchCount}\n`;
        });
        csv += '\n';

        // Daily breakdown (only if includeDailyBreakdown option is true)
        if (reportData.options?.includeDailyBreakdown && reportData.data.dailyData && Object.keys(reportData.data.dailyData).length > 0) {
            csv += '=== GÜNLÜK AKTİVİTE DETAYI ===\n\n';

            // Sort days chronologically
            const sortedDays = Object.keys(reportData.data.dailyData).sort();

            sortedDays.forEach(dayKey => {
                const dayData = reportData.data.dailyData[dayKey];
                const dateObj = new Date(dayKey);
                const formattedDate = formatDateTurkish(dateObj);
                const dayName = getTurkishDayName(dateObj);

                csv += `--- ${formattedDate} (${dayName}) ---\n\n`;

                // User breakdown for this day
                csv += 'Kullanıcı,Aktif Süre,Uygulama Sayısı,Web Sitesi Sayısı,En Çok Kullanılan Uygulama,En Çok Ziyaret Edilen Site\n';

                // Sort users by active time for this day
                const dayUsers = Object.entries(dayData.users)
                    .sort((a, b) => b[1].activeTime - a[1].activeTime);

                dayUsers.forEach(([userName, userData]) => {
                    // Get app and website counts
                    const appCount = Object.keys(userData.apps || {}).length;
                    const websiteCount = Object.keys(userData.websites || {}).length;

                    // Get top app
                    const topApp = Object.entries(userData.apps || {})
                        .sort((a, b) => b[1] - a[1])[0];
                    const topAppStr = topApp ? `${topApp[0]} (${formatTime(topApp[1])})` : '-';

                    // Get top website
                    const topSite = Object.entries(userData.websites || {})
                        .sort((a, b) => b[1] - a[1])[0];
                    const topSiteStr = topSite ? `${topSite[0]} (${formatTime(topSite[1])})` : '-';

                    csv += `"${userData.displayName}",${formatTime(userData.activeTime)},${appCount},${websiteCount},"${topAppStr}","${topSiteStr}"\n`;
                });

                csv += '\n';
            });
        }

        // Per-user application breakdown (only if includeApps option is true)
        if (reportData.options?.includeApps !== false) {
            csv += '=== KULLANICI BAZLI UYGULAMA KULLANIMI ===\n';
            sortedUsers.forEach(user => {
                if (user.applications && Object.keys(user.applications).length > 0) {
                    csv += `\n"${user.displayName}" - Uygulama Kullanımı\n`;
                    csv += 'Uygulama Adı,Kullanım Süresi\n';

                    Object.entries(user.applications)
                        .sort((a, b) => b[1] - a[1])
                        .forEach(([app, time]) => {
                            csv += `"${app}",${formatTime(time)}\n`;
                        });
                }
            });
            csv += '\n';
        }

        // Per-user website breakdown (only if includeWebsites option is true)
        if (reportData.options?.includeWebsites !== false) {
            csv += '=== KULLANICI BAZLI WEB SİTESİ KULLANIMI ===\n';
            sortedUsers.forEach(user => {
                if (user.websites && Object.keys(user.websites).length > 0) {
                    csv += `\n"${user.displayName}" - Web Sitesi Kullanımı\n`;
                    csv += 'Web Sitesi,Kullanım Süresi\n';

                    Object.entries(user.websites)
                        .sort((a, b) => b[1] - a[1])
                        .forEach(([site, time]) => {
                            csv += `"${site}",${formatTime(time)}\n`;
                        });
                }
            });
            csv += '\n';
        }
    }

    // Footer
    csv += '\n=== RAPOR SONU ===\n';
    csv += `Rapor ID: ${reportData.id}\n`;
    csv += `Oluşturulma Zamanı: ${new Date(reportData.createdAt).toLocaleString('tr-TR')}\n`;

    // Create filename with date range
    const startDate = formatDateTurkish(new Date(reportData.dateRange.start)).replace(/ /g, '_');
    const endDate = formatDateTurkish(new Date(reportData.dateRange.end)).replace(/ /g, '_');
    const filename = `ActivityX_Rapor_${startDate}_${endDate}.csv`;

    // Create and download the file
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Download current report as CSV (wrapper for backward compatibility)
function downloadCurrentReportAsCSV() {
    if (!currentReportData) return;
    downloadReportAsCSV(currentReportData);
}

// Report History Functions
function loadReportHistory() {
    const stored = localStorage.getItem('reportHistory');
    if (stored) {
        reportHistory = JSON.parse(stored);
    }
}

function saveReportHistory() {
    localStorage.setItem('reportHistory', JSON.stringify(reportHistory));
}

function addToReportHistory(reportData) {
    // Keep only essential data in history
    const historyItem = {
        id: reportData.id,
        createdAt: reportData.createdAt,
        dateRange: reportData.dateRange,
        userCount: reportData.users.length,
        options: reportData.options,
        summary: reportData.data.summary
    };

    // Add to beginning of array
    reportHistory.unshift(historyItem);

    // Keep only last 20 reports
    if (reportHistory.length > 20) {
        reportHistory = reportHistory.slice(0, 20);
    }

    saveReportHistory();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    if (reportHistory.length === 0) {
        // Show empty state
        historyList.innerHTML = `
            <div class="empty-history" id="empty-history">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p>Henüz rapor oluşturulmamış</p>
                <span>Yukarıdaki filtreleri kullanarak ilk raporunuzu oluşturun</span>
            </div>
        `;
    } else {
        // Show history items
        let html = '';
        reportHistory.forEach((item, index) => {
            const createdDate = formatDateTurkish(new Date(item.createdAt));
            const startDate = formatDateTurkish(new Date(item.dateRange.start));
            const endDate = formatDateTurkish(new Date(item.dateRange.end));

            html += `
                <div class="history-item">
                    <div class="history-item-info">
                        <div class="history-item-title">
                            Rapor #${reportHistory.length - index}
                        </div>
                        <div class="history-item-details">
                            <span class="history-item-detail">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                ${createdDate}
                            </span>
                            <span class="history-item-detail">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                ${startDate} - ${endDate}
                            </span>
                            <span class="history-item-detail">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                ${item.userCount} kullanıcı
                            </span>
                        </div>
                    </div>
                    <div class="history-item-actions">
                        <button class="history-item-btn" onclick="regenerateReport('${item.id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Yeniden Oluştur
                        </button>
                        <button class="history-item-btn" onclick="deleteHistoryItem('${item.id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Sil
                        </button>
                    </div>
                </div>
            `;
        });
        historyList.innerHTML = html;
    }
}

// Regenerate report from history
function regenerateReport(reportId) {
    const historyItem = reportHistory.find(item => item.id === reportId);
    if (!historyItem) return;

    // Set the global date variables
    reportStartDate = new Date(historyItem.dateRange.start);
    reportEndDate = new Date(historyItem.dateRange.end);
    window.reportStartDate = reportStartDate;
    window.reportEndDate = reportEndDate;

    // Update the date display texts
    const startDateText = document.getElementById('report-start-date-text');
    const endDateText = document.getElementById('report-end-date-text');

    if (startDateText) {
        startDateText.textContent = formatDateTurkish(reportStartDate);
    }
    if (endDateText) {
        endDateText.textContent = formatDateTurkish(reportEndDate);
    }

    // Show date range summary
    const summaryEl = document.getElementById('report-date-range-summary');
    const summaryText = document.getElementById('report-date-range-text');
    if (summaryEl && summaryText) {
        const daysDiff = Math.ceil((reportEndDate - reportStartDate) / (1000 * 60 * 60 * 24)) + 1;
        summaryText.textContent = `${daysDiff} gün seçildi`;
        summaryEl.style.display = 'flex';
    }

    // Set user selection based on history
    if (historyItem.userSelection) {
        const selectionType = historyItem.userSelection.type || 'all';

        // Click the appropriate selection button
        const selectionBtns = document.querySelectorAll('.selection-btn');
        selectionBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.selection === selectionType) {
                btn.classList.add('active');
                btn.click(); // Trigger the selection
            }
        });

        // If specific users were selected, restore them
        if (selectionType === 'specific' && historyItem.userSelection.userIds) {
            setTimeout(() => {
                historyItem.userSelection.userIds.forEach(userId => {
                    const checkbox = document.querySelector(`#users-list input[value="${userId}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                updateSelectedUsersCount();
            }, 100);
        }

        // If a team was selected, restore it
        if (selectionType === 'team' && historyItem.userSelection.teamId) {
            setTimeout(() => {
                const teamSelect = document.getElementById('team-select');
                if (teamSelect) {
                    teamSelect.value = historyItem.userSelection.teamId;
                    teamSelect.dispatchEvent(new Event('change'));
                }
            }, 100);
        }
    }

    // Generate the report
    generateReport();
}

// Delete history item
function deleteHistoryItem(reportId) {
    reportHistory = reportHistory.filter(item => item.id !== reportId);
    saveReportHistory();
    updateHistoryDisplay();
}

// Clear history modal functions
function showClearHistoryModal() {
    const modal = document.getElementById('clear-history-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideClearHistoryModal() {
    const modal = document.getElementById('clear-history-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function clearReportHistory() {
    reportHistory = [];
    saveReportHistory();
    updateHistoryDisplay();
    hideClearHistoryModal();
}

// Make functions globally available
window.initReportsPage = initReportsPage;
window.regenerateReport = regenerateReport;
window.deleteHistoryItem = deleteHistoryItem;