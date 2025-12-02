const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { machineId } = require('node-machine-id')

let mainWindow

async function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  const startUrl = process.env.VITE_DEV_SERVER_URL
  if (startUrl) {
    await mainWindow.loadURL(startUrl)
  } else {
    await mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

ipcMain.handle('get-machine-id', async () => {
  try {
    return await machineId(true)
  } catch (err) {
    console.error('Error getting machineId:', err)
    return 'error-machine-id'
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
