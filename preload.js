const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  signUpUser: (userData) => ipcRenderer.invoke('signup-user', userData),
  signInUser: (email, password) => ipcRenderer.invoke('signin-user', email, password),
  signOutUser: () => ipcRenderer.invoke('signout-user'),
  authSuccess: (userData) => ipcRenderer.invoke('auth-success', userData),
  getUserSession: () => ipcRenderer.invoke('get-user-session'),
  getCurrentUser: () => ipcRenderer.invoke('get-current-user'),
  changePassword: (passwords) => ipcRenderer.invoke('change-password', passwords),
  authLogout: () => ipcRenderer.invoke('auth-logout')
});

// If your app doesn't need any special APIs, this file can be minimal
// The main purpose is to enable contextIsolation while maintaining security