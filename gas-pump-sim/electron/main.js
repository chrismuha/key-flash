const path = require('path');
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    backgroundColor: '#101615',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const devUrl = 'http://127.0.0.1:5173';
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

  if (!app.isPackaged) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(indexPath);
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
