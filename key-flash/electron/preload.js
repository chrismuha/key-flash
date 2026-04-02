
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('keyFlashAPI', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (s) => ipcRenderer.invoke('settings:set', s)
});
