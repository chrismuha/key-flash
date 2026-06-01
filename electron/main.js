const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-logging');
app.commandLine.appendSwitch('log-level', '3');

const path = require('path');
const fs = require('fs');
const Store = require('electron-store').default;
const { loadRenderer } = require('../startup-mode.cjs');

const APP_NAME = 'Key Flash';
const APP_ID = 'com.muha.keyflash';

function applyAppIdentity() {
  app.setName(APP_NAME);
  app.setAppUserModelId(APP_ID);

  if (process.platform === 'darwin') {
    app.setAboutPanelOptions({
      applicationName: APP_NAME,
      applicationVersion: app.getVersion()
    });
  }
}

applyAppIdentity();

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

function getAppIconPath() {
  const iconFileNameByPlatform = {
    darwin: 'icon.icns',
    win32: 'icon.ico',
    linux: 'icon.png'
  };

  return path.join(app.getAppPath(), 'build', iconFileNameByPlatform[process.platform] || 'icon.png');
}

function getDockIconImage() {
  const image = nativeImage.createFromPath(path.join(app.getAppPath(), 'build', 'icon.png'));
  return image.isEmpty() ? null : image;
}

function applyMacDockIcon() {
  if (process.platform !== 'darwin' || !app.dock?.setIcon) {
    return;
  }

  const dockIcon = getDockIconImage();
  if (dockIcon) {
    app.dock.setIcon(dockIcon);
  }
}

function createWindow() {
  const appIconPath = getAppIconPath();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 680,
    title: APP_NAME,
    backgroundColor: '#05070b',
    autoHideMenuBar: true,
    ...(fs.existsSync(appIconPath) ? { icon: appIconPath } : {}),
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
  applyAppIdentity();
  applyMacDockIcon();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!app.isPackaged || process.platform !== 'darwin') app.quit();
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
