// LocalStorage Diagnostic Tool
// Run this in the browser console to debug localStorage issues

function diagnoseLocalStorage() {
    console.group('🔍 LocalStorage Diagnostic Report');

    // Check if localStorage is available
    console.log('1. LocalStorage Support:');
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        console.log('   ✅ LocalStorage is available and writable');
    } catch (e) {
        console.error('   ❌ LocalStorage error:', e);
        console.groupEnd();
        return;
    }

    // Check storage keys
    const STORAGE_KEY = 'kta_persisted_users_v1';
    const TEAMS_KEY = 'kta_teams_v1';

    console.log('\n2. Storage Keys:');
    console.log('   Expected user data key:', STORAGE_KEY);
    console.log('   Expected teams data key:', TEAMS_KEY);
    console.log('   All keys in localStorage:', Object.keys(localStorage));

    // Check for any keys that might contain user data
    const allKeys = Object.keys(localStorage);
    const potentialUserKeys = allKeys.filter(key =>
        key.includes('user') ||
        key.includes('kta') ||
        key.includes('persisted') ||
        key.includes('data')
    );

    if (potentialUserKeys.length > 0) {
        console.log('   Potential user data keys found:', potentialUserKeys);
        potentialUserKeys.forEach(key => {
            const value = localStorage.getItem(key);
            console.log(`     ${key}: ${value ? value.substring(0, 100) + '...' : 'empty'}`);
        });
    }

    // Check user data
    console.log('\n3. User Data Analysis:');
    const userData = localStorage.getItem(STORAGE_KEY);
    if (userData) {
        try {
            const users = JSON.parse(userData);
            console.log('   ✅ User data found');
            console.log('   Data size:', (userData.length / 1024).toFixed(2), 'KB');
            console.log('   Number of users:', Array.isArray(users) ? users.length : 'Not an array');

            if (Array.isArray(users) && users.length > 0) {
                const sampleUser = users[0];
                console.log('   Sample user structure:');
                console.log('     - Name:', sampleUser.name || 'No name');
                console.log('     - ID:', sampleUser.userId || sampleUser.id || 'No ID');
                console.log('     - Active time:', sampleUser.activeTime?.total || 0, 'seconds');
                console.log('     - Apps:', sampleUser.apps?.length || 0);
                console.log('     - Websites:', sampleUser.websites?.length || 0);
                console.log('     - Batches:', sampleUser.batchIds?.length || 0);
            }
        } catch (e) {
            console.error('   ❌ Failed to parse user data:', e);
        }
    } else {
        console.warn('   ⚠️ No user data found in localStorage');
        console.log('   Try running: generateDummyData()');
    }

    // Check team data
    console.log('\n4. Team Data Analysis:');
    const teamData = localStorage.getItem(TEAMS_KEY);
    if (teamData) {
        try {
            const teams = JSON.parse(teamData);
            console.log('   ✅ Team data found');
            console.log('   Number of teams:', Array.isArray(teams) ? teams.length : 'Not an array');
        } catch (e) {
            console.error('   ❌ Failed to parse team data:', e);
        }
    } else {
        console.log('   ℹ️ No team data found');
    }

    // Check global variables
    console.log('\n5. Global Variables Status:');
    console.log('   window.users:', typeof window.users !== 'undefined' ? `Array(${window.users?.length || 0})` : 'undefined');
    console.log('   window.filteredUsers:', typeof window.filteredUsers !== 'undefined' ? `Array(${window.filteredUsers?.length || 0})` : 'undefined');
    console.log('   window.router:', typeof window.router !== 'undefined' ? 'Initialized' : 'undefined');

    // Check current page elements
    console.log('\n6. UI Elements Check:');
    const elements = {
        'page-content': document.getElementById('page-content'),
        'users-table-body': document.getElementById('users-table-body'),
        'activity-chart': document.getElementById('activity-chart'),
        'apps-chart': document.getElementById('apps-chart'),
        'websites-chart': document.getElementById('websites-chart'),
        'top-users-chart': document.getElementById('top-users-chart')
    };

    Object.entries(elements).forEach(([id, el]) => {
        console.log(`   ${id}: ${el ? '✅ Found' : '❌ Not found'}`);
    });

    // Suggest actions
    console.log('\n7. Suggested Actions:');
    if (!userData) {
        console.log('   1. Generate dummy data: generateDummyData()');
        console.log('   2. Or fetch from Supabase using the "Verileri Güncelle" button');
    } else if (users && users.length === 0) {
        console.log('   1. The data array is empty. Try fetching fresh data.');
    } else {
        console.log('   1. Force reload with data: forceReloadWithData()');
        console.log('   2. Navigate to dashboard: router.navigate("dashboard")');
        console.log('   3. Update charts manually: updateCharts()');
    }

    console.groupEnd();
}

// Function to clear and regenerate test data
function resetWithTestData() {
    console.log('Clearing localStorage and generating test data...');
    localStorage.clear();
    generateDummyData();
    location.reload();
}

// Function to check if data is loading properly on page navigation
function testPageNavigation() {
    console.group('🧪 Testing Page Navigation');

    const pages = ['dashboard', 'table', 'reports', 'calisanlar', 'ekipler'];

    pages.forEach(page => {
        console.log(`Testing navigation to: ${page}`);
        router.navigate(page);

        setTimeout(() => {
            const pageContent = document.getElementById('page-content');
            console.log(`  ${page}: ${pageContent && pageContent.innerHTML.length > 100 ? '✅ Content loaded' : '❌ No content'}`);
        }, 500);
    });

    console.groupEnd();
}

// Make functions globally available
window.diagnoseLocalStorage = diagnoseLocalStorage;
window.resetWithTestData = resetWithTestData;
window.testPageNavigation = testPageNavigation;

console.log('🔧 LocalStorage diagnostic tool loaded!');
console.log('Available commands:');
console.log('  - diagnoseLocalStorage(): Run full diagnostic');
console.log('  - resetWithTestData(): Clear and regenerate test data');
console.log('  - testPageNavigation(): Test all page navigation');