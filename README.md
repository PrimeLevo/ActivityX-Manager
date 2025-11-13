# Activity Tracker Admin Dashboard

A professional admin panel for monitoring user activity across multiple users. Built with Electron and JavaScript for cross-platform compatibility (Mac & Windows).

## Features

- **Professional Dashboard**: Clean, modern interface suitable for law firm partners
- **100 User Management**: View and manage activity data for 100 users with dummy data
- **Interactive Charts**: Daily, weekly, and monthly activity visualizations
- **Comprehensive Tracking**: Monitor active/inactive time, app usage, and website visits
- **Advanced Filtering**: Search users, sort by various criteria, and paginate results
- **Detailed User Views**: Individual user modals with detailed breakdowns
- **Cross-Platform**: Works seamlessly on both Mac and Windows

## Data Tracked

For each user, the admin can view:
- **User Name**: Full name of the employee
- **Active Time**: Hours and minutes of active computer usage
- **Inactive Time**: Hours and minutes of inactive/idle time
- **Apps Used**: List of applications with usage duration
- **Websites Visited**: List of websites with time spent
- **Last Activity**: Timestamp of most recent activity

## Screenshots

The dashboard includes:
- Overview statistics cards
- Interactive time-period charts (Daily/Weekly/Monthly)
- Comprehensive user table with pagination
- Detailed user modals with individual charts

## Installation

1. **Clone or download** this repository to your local machine

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

## Development

To run in development mode with DevTools:
```bash
npm run dev
```

## Building

To build for distribution:

**For Mac:**
```bash
npm run build-mac
```

**For Windows:**
```bash
npm run build-win
```

**For both platforms:**
```bash
npm run build
```

## Usage

1. **Launch the application** - The dashboard will load with 100 users of dummy data
2. **View Overview** - Check the statistics cards at the top for quick insights
3. **Switch Time Periods** - Use Daily/Weekly/Monthly buttons to change chart views
4. **Browse Users** - Use the table to view all users with pagination
5. **Search Users** - Use the search box to find specific users
6. **Sort Data** - Use the dropdown to sort by name, active time, or inactive time
7. **View Details** - Click "View Details" for any user to see detailed charts
8. **Refresh Data** - Click the refresh button to generate new dummy data

## Data Structure

Each user object contains:
```javascript
{
  id: Number,
  name: String,
  activeTime: { hours: Number, minutes: Number, total: Number },
  inactiveTime: { hours: Number, minutes: Number, total: Number },
  apps: [{ name: String, usage: Number }],
  websites: [{ name: String, usage: Number }],
  lastActivity: Date
}
```

## API Integration

To integrate with real data:

1. Replace the `generateDummyData()` function with actual API calls
2. Modify the `refresh-btn` event listener to fetch new data from your server
3. Update the data structure as needed to match your API response

Example API integration:
```javascript
async function fetchUserData() {
  try {
    const response = await fetch('/api/users/activity');
    const data = await response.json();
    users = data;
    filteredUsers = [...users];
    renderDashboard();
    updateUserTable();
    updateCharts();
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
}
```

## Customization

- **Colors**: Modify the CSS color scheme in `styles.css`
- **Charts**: Customize Chart.js configurations in `app.js`
- **Data Sources**: Add new apps/websites to the sample arrays
- **Metrics**: Add new tracking metrics by extending the user data structure

## Technical Details

- **Framework**: Electron for cross-platform desktop app
- **Charts**: Chart.js for interactive visualizations
- **Styling**: Custom CSS with modern design principles
- **Data**: Client-side JavaScript with dummy data generation
- **Responsive**: Adapts to different window sizes

## Browser Compatibility

As an Electron app, this runs with Chromium engine and supports all modern web features.

## License

PROPRIETARY - All rights reserved.

## Support

For law firm specific customizations or enterprise features, contact the development team.