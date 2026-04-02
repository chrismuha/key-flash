
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({
  defaults: {
    flashDelayMs: 0,
    minTimeBetweenFlashesMs: 120,
    flashDurationMs: 140,
    colors: ['red','orange','yellow','green','blue','indigo','violet']
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

ipcMain.handle('settings:get', () => store.store);
ipcMain.handle('settings:set', (_, s) => {
  store.set(s);
  return store.store;
});
