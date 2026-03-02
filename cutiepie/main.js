const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const { app, BrowserWindow, ipcMain } = require('electron');

const STATE_FILE_NAME = 'cutiepie-state.json';
const SETTINGS_FILE_NAME = 'cutiepie-settings.json';
let isQuitting = false;
let quitPromptPending = false;

function getDataFilePath(fileName) {
  return path.join(app.getPath('userData'), fileName);
}

async function readJsonFile(fileName) {
  const filePath = getDataFilePath(fileName);
  const contents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(contents);
}

async function writeJsonFile(fileName, payload) {
  const filePath = getDataFilePath(fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

async function clearJsonFile(fileName) {
  const filePath = getDataFilePath(fileName);
  await fs.rm(filePath, { force: true });
}

ipcMain.handle('cutiepie:state:load', async () => {
  try {
    const state = await readJsonFile(STATE_FILE_NAME);
    return { ok: true, state };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { ok: true, state: null };
    }
    return { ok: false, error: 'load_failed' };
  }
});

ipcMain.handle('cutiepie:state:save', async (_event, payload) => {
  try {
    await writeJsonFile(STATE_FILE_NAME, payload);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'save_failed' };
  }
});

ipcMain.handle('cutiepie:state:clear', async () => {
  try {
    await clearJsonFile(STATE_FILE_NAME);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'clear_failed' };
  }
});

ipcMain.handle('cutiepie:settings:load', async () => {
  try {
    const settings = await readJsonFile(SETTINGS_FILE_NAME);
    return { ok: true, settings };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { ok: true, settings: null };
    }
    return { ok: false, error: 'load_failed' };
  }
});

ipcMain.handle('cutiepie:settings:save', async (_event, payload) => {
  try {
    await writeJsonFile(SETTINGS_FILE_NAME, payload);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'save_failed' };
  }
});

ipcMain.handle('cutiepie:settings:clear', async () => {
  try {
    await clearJsonFile(SETTINGS_FILE_NAME);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'clear_failed' };
  }
});

function requestQuitConfirmation() {
  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (!win || win.isDestroyed()) {
    return false;
  }

  if (quitPromptPending) {
    return true;
  }

  quitPromptPending = true;
  win.webContents.send('cutiepie:request-quit-confirm');
  return true;
}

async function hasUnsavedChanges(win) {
  if (!win || win.isDestroyed()) {
    return true;
  }

  try {
    const result = await win.webContents.executeJavaScript('Boolean(window.__CUTIEPIE_HAS_UNSAVED === true)', true);
    return Boolean(result);
  } catch (error) {
    return true;
  }
}

ipcMain.handle('cutiepie:quit:confirm', () => {
  isQuitting = true;
  quitPromptPending = false;
  app.quit();
  return { ok: true };
});

ipcMain.handle('cutiepie:quit:cancel', () => {
  quitPromptPending = false;
  return { ok: true };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    backgroundColor: '#f6f7fb',
    title: 'CutiePie Chart Studio',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.on('close', async (event) => {
    if (isQuitting) {
      return;
    }

    if (win.__allowCloseOnce) {
      win.__allowCloseOnce = false;
      return;
    }

    event.preventDefault();

    const unsaved = await hasUnsavedChanges(win);
    if (!unsaved) {
      win.__allowCloseOnce = true;
      win.close();
      return;
    }

    requestQuitConfirmation();
  });

  const distIndexPath = path.join(__dirname, 'dist', 'index.html');
  if (fsSync.existsSync(distIndexPath)) {
    win.loadFile(distIndexPath);
  } else {
    win.loadFile('index.html');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', (event) => {
  if (isQuitting) {
    return;
  }

  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (!win || win.isDestroyed()) {
    return;
  }

  event.preventDefault();

  hasUnsavedChanges(win)
    .then((unsaved) => {
      if (unsaved) {
        requestQuitConfirmation();
        return;
      }

      isQuitting = true;
      app.quit();
    })
    .catch(() => {
      requestQuitConfirmation();
    });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
