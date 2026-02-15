const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("wpmBridge", {
    sendStats: (payload) => ipcRenderer.send("stats-update", payload),
    onStats: (handler) => {
        ipcRenderer.on("stats-update", (_event, data) => handler(data));
    },
    sendAction: (action) => ipcRenderer.send("overlay-action", action),
    onAction: (handler) => {
        ipcRenderer.on("overlay-action", (_event, action) => handler(action));
    },
    openOverlay: () => ipcRenderer.send("open-overlay")
});
