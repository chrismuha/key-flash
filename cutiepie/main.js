const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

const STATE_FILE_NAME = 'cutiepie-state.json';
const SETTINGS_FILE_NAME = 'cutiepie-settings.json';
const BACKUP_DIR_NAME = 'backups';
const BACKUP_FILE_PREFIX = 'cutiepie-backup-';
const EXPORTS_DIR_NAME = 'exports';
let isQuitting = false;
let quitPromptPending = false;

function getDataFilePath(fileName) {
  return path.join(app.getPath('userData'), fileName);
}

function getBackupDirPath() {
  return path.join(app.getPath('userData'), BACKUP_DIR_NAME);
}

function getExportsDirPath() {
  return path.join(app.getPath('downloads'), EXPORTS_DIR_NAME);
}

function getDefaultExportFilePath(fileName) {
  return path.join(getExportsDirPath(), fileName);
}

function buildBackupFileName() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${BACKUP_FILE_PREFIX}${timestamp}.json`;
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

async function readJsonFileIfExists(fileName) {
  try {
    return await readJsonFile(fileName);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
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

ipcMain.handle('cutiepie:backup:create', async () => {
  try {
    const state = await readJsonFileIfExists(STATE_FILE_NAME);
    const settings = await readJsonFileIfExists(SETTINGS_FILE_NAME);
    const backupPayload = {
      version: 1,
      createdAt: new Date().toISOString(),
      state,
      settings
    };

    const backupDirPath = getBackupDirPath();
    await fs.mkdir(backupDirPath, { recursive: true });
    const backupFileName = buildBackupFileName();
    const backupFilePath = path.join(backupDirPath, backupFileName);
    await fs.writeFile(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf8');

    return { ok: true, fileName: backupFileName, createdAt: backupPayload.createdAt };
  } catch (error) {
    return { ok: false, error: 'backup_create_failed' };
  }
});

ipcMain.handle('cutiepie:backup:restoreLatest', async () => {
  try {
    const backupDirPath = getBackupDirPath();
    const entries = await fs.readdir(backupDirPath);
    const backupFiles = entries
      .filter((name) => name.startsWith(BACKUP_FILE_PREFIX) && name.endsWith('.json'))
      .sort()
      .reverse();

    if (backupFiles.length === 0) {
      return { ok: false, error: 'no_backup_found' };
    }

    const latestFile = backupFiles[0];
    const latestPath = path.join(backupDirPath, latestFile);
    const raw = await fs.readFile(latestPath, 'utf8');
    const backupPayload = JSON.parse(raw);

    if (backupPayload && typeof backupPayload === 'object') {
      if (backupPayload.state != null) {
        await writeJsonFile(STATE_FILE_NAME, backupPayload.state);
      }
      if (backupPayload.settings != null) {
        await writeJsonFile(SETTINGS_FILE_NAME, backupPayload.settings);
      }
    }

    return {
      ok: true,
      fileName: latestFile,
      restoredAt: new Date().toISOString(),
      backupCreatedAt: backupPayload?.createdAt || null
    };
  } catch (error) {
    return { ok: false, error: 'backup_restore_failed' };
  }
});

ipcMain.handle('cutiepie:pdf:exportCurrentPage', async (_event, payload) => {
  try {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (!win || win.isDestroyed()) {
      return { ok: false, error: 'window_unavailable' };
    }

    const pageName = String(payload?.pageName || 'page').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
    const safePageName = pageName || 'page';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `cutiepie-${safePageName}-${timestamp}.pdf`;
    const defaultPath = getDefaultExportFilePath(fileName);
    await fs.mkdir(path.dirname(defaultPath), { recursive: true });

    const saveDialog = await dialog.showSaveDialog(win, {
      title: 'Save PDF Export',
      defaultPath,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (saveDialog.canceled || !saveDialog.filePath) {
      return { ok: false, canceled: true };
    }

    const buffer = await win.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true
    });
    await fs.writeFile(saveDialog.filePath, buffer);

    return { ok: true, fileName: path.basename(saveDialog.filePath), filePath: saveDialog.filePath };
  } catch (_error) {
    return { ok: false, error: 'pdf_export_failed' };
  }
});

ipcMain.handle('cutiepie:export:saveText', async (_event, payload) => {
  try {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (!win || win.isDestroyed()) {
      return { ok: false, error: 'window_unavailable' };
    }

    const content = String(payload?.content ?? '');
    const defaultName = String(payload?.defaultName || 'cutiepie-export.txt');
    const filters = Array.isArray(payload?.filters) ? payload.filters : [{ name: 'Text', extensions: ['txt'] }];
    const defaultPath = getDefaultExportFilePath(defaultName);

    await fs.mkdir(path.dirname(defaultPath), { recursive: true });
    const saveDialog = await dialog.showSaveDialog(win, {
      title: 'Save Export',
      defaultPath,
      filters
    });

    if (saveDialog.canceled || !saveDialog.filePath) {
      return { ok: false, canceled: true };
    }

    await fs.writeFile(saveDialog.filePath, content, 'utf8');
    return { ok: true, fileName: path.basename(saveDialog.filePath), filePath: saveDialog.filePath };
  } catch (_error) {
    return { ok: false, error: 'export_save_failed' };
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
