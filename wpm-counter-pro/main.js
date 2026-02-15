const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow;
let overlayWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload/main.js")
        }
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

function createOverlayWindow() {
    overlayWindow = new BrowserWindow({
        width: 320,
        height: 240,
        frame: true,
        resizable: false,
        movable: true,
        maximizable: false,
        minimizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload/main.js")
        }
    });

    overlayWindow.loadFile(path.join(__dirname, "index.html"), { hash: "overlay" });
    overlayWindow.on("closed", () => {
        overlayWindow = null;
    });
}

function openOverlayWindow() {
    if (overlayWindow) {
        overlayWindow.focus();
        return;
    }
    createOverlayWindow();
}

ipcMain.on("stats-update", (_event, payload) => {
    if (overlayWindow) {
        overlayWindow.webContents.send("stats-update", payload);
    }
});

ipcMain.on("overlay-action", (_event, action) => {
    if (mainWindow) {
        mainWindow.webContents.send("overlay-action", action);
    }
});

ipcMain.on("open-overlay", () => {
    openOverlayWindow();
});

app.whenReady().then(() => {
    createMainWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
            createOverlayWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
