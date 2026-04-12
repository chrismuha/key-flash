const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('keyFlashAPI', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (patch) => ipcRenderer.invoke('settings:set', patch),
  setFullscreen: (value) => ipcRenderer.invoke('window:setFullscreen', value),
  toggleFullscreen: () => ipcRenderer.invoke('window:toggleFullscreen')
});
