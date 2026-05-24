const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store').default;
const { loadRenderer } = require('../startup-mode.cjs');

const store = new Store({
  projectName: 'key-flash',
  defaults: {
    flashDelayMs: 0,
    minTimeBetweenFlashesMs: 120,
    flashDurationMs: 160,
    colors: ['#ff0000','#ff7f00','#ffff00','#00ff00','#0000ff','#4b0082','#9400d3'],
    colorOrder: 'sequence',
    flashOpacity: 1,
    fullscreenOnLaunch: false,
    focusMode: false,
    showHero: true,
    showSettingsPanel: true,
    showStatusPanel: true,
    closeSettingsOnOutsideClick: true
  }
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 680,
    backgroundColor: '#05070b',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (store.get('fullscreenOnLaunch')) {
    mainWindow.maximize();
  }

  loadRenderer(mainWindow, {
    defaultCloudUrl: 'http://localhost:5189',
    localFile: path.join(__dirname, '..', 'dist', 'index.html'),
  });

  if (!app.isPackaged) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      const isDevToolsKey = input.key?.toLowerCase() === 'i' || input.code === 'KeyI';
      if (((input.meta && input.alt) || (input.control && input.shift)) && isDevToolsKey) {
        event.preventDefault();
        mainWindow.webContents.toggleDevTools();
      }
    });
    if (process.env.OPEN_DEVTOOLS === '1') mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('settings:get', async () => store.store);

ipcMain.handle('settings:set', async (_event, patch) => {
  const next = { ...store.store, ...patch };
  store.set(next);
  return store.store;
});

ipcMain.handle('window:setFullscreen', async (_event, value) => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  if (win) {
    win.setFullScreen(Boolean(value));
  }
  return win ? win.isFullScreen() : false;
});

ipcMain.handle('window:toggleFullscreen', async () => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  if (!win) return false;
  win.setFullScreen(!win.isFullScreen());
  return win.isFullScreen();
});
