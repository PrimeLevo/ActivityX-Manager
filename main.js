const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Check if user is already logged in
  const isLoggedIn = checkAuthSession();

  if (isLoggedIn) {
    mainWindow.loadFile('index.html');
  } else {
    mainWindow.loadFile('auth.html');
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', () => {
    app.quit();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  const template = [
    {
      label: 'Dosya',
      submenu: [
        {
          label: 'Verileri Yenile',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Çıkış',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Pencere',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Session management functions
const os = require('os');
const fs = require('fs');

const sessionPath = path.join(os.homedir(), '.activityx-session.json');

function checkAuthSession() {
  try {
    if (fs.existsSync(sessionPath)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

      // Check if session is still valid (not expired)
      if (sessionData.expiresAt && new Date() < new Date(sessionData.expiresAt)) {
        return true;
      } else {
        // Session expired, clean it up
        clearAuthSession();
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking auth session:', error);
    return false;
  }
}

function saveAuthSession(userData) {
  try {
    const sessionData = {
      user: userData,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
    console.log('Auth session saved successfully');
  } catch (error) {
    console.error('Error saving auth session:', error);
  }
}

function clearAuthSession() {
  try {
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
      console.log('Auth session cleared');
    }
  } catch (error) {
    console.error('Error clearing auth session:', error);
  }
}

// Import Supabase functions
const { signUpUser, signInUser, signOutUser, getCurrentUser, changePassword } = require('./supabase-config');

// IPC handlers for auth communication
ipcMain.handle('auth-success', async (event, userData) => {
  saveAuthSession(userData);
  mainWindow.loadFile('index.html');
});

ipcMain.handle('auth-logout', async (event) => {
  clearAuthSession();
  mainWindow.loadFile('auth.html');
});

// IPC handlers for Supabase authentication
ipcMain.handle('signup-user', async (event, userData) => {
  try {
    return await signUpUser(userData);
  } catch (error) {
    console.error('Main process signup error:', error);
    return {
      success: false,
      message: 'Bir hata oluştu. Lütfen tekrar deneyiniz.'
    };
  }
});

ipcMain.handle('signin-user', async (event, email, password) => {
  try {
    return await signInUser(email, password);
  } catch (error) {
    console.error('Main process signin error:', error);
    return {
      success: false,
      message: 'Bir hata oluştu. Lütfen tekrar deneyiniz.'
    };
  }
});

ipcMain.handle('signout-user', async (event) => {
  try {
    return await signOutUser();
  } catch (error) {
    console.error('Main process signout error:', error);
    return false;
  }
});

ipcMain.handle('get-user-session', async (event) => {
  try {
    if (fs.existsSync(sessionPath)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));

      // Check if session is still valid
      if (sessionData.expiresAt && new Date() < new Date(sessionData.expiresAt)) {
        return sessionData;
      } else {
        // Session expired
        clearAuthSession();
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
});

ipcMain.handle('get-current-user', async (event) => {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      // Update session with fresh user data
      const sessionData = {
        user: currentUser,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      saveAuthSession(currentUser);
      return sessionData;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
});

ipcMain.handle('change-password', async (event, passwords) => {
  try {
    // Read the current session to get the access token
    let accessToken = null;

    if (fs.existsSync(sessionPath)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      // The access token should be in the user session
      accessToken = sessionData.user?.session?.access_token;

      console.log('Session data:', sessionData);
      console.log('Access token found:', !!accessToken);
    }

    if (!accessToken) {
      console.error('No access token found in session');
      return {
        success: false,
        message: 'Oturum bulunamadı. Lütfen tekrar giriş yapınız.'
      };
    }

    const result = await changePassword(passwords.newPassword, accessToken);

    if (result.success) {
      // Sign out user after successful password change
      await signOutUser();
      clearAuthSession();

      // Redirect to auth page
      if (mainWindow) {
        mainWindow.loadFile('auth.html');
      }
    }

    return result;
  } catch (error) {
    console.error('Error changing password:', error);
    return {
      success: false,
      message: 'Bir hata oluştu. Lütfen tekrar deneyiniz.'
    };
  }
});