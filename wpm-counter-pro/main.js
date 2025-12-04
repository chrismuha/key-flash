const path = require("path");
const { app, BrowserWindow } = require("electron");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 750,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
