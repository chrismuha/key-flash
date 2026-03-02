const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cutiepieDesktop', {
  platform: process.platform,
  onQuitRequested: (callback) => {
    if (typeof callback !== 'function') {
      return () => {};
    }

    const listener = () => callback();
    ipcRenderer.on('cutiepie:request-quit-confirm', listener);
    return () => {
      ipcRenderer.removeListener('cutiepie:request-quit-confirm', listener);
    };
  },
  quit: {
    confirm: () => ipcRenderer.invoke('cutiepie:quit:confirm'),
    cancel: () => ipcRenderer.invoke('cutiepie:quit:cancel')
  },
  state: {
    load: () => ipcRenderer.invoke('cutiepie:state:load'),
    save: (payload) => ipcRenderer.invoke('cutiepie:state:save', payload),
    clear: () => ipcRenderer.invoke('cutiepie:state:clear')
  },
  settings: {
    load: () => ipcRenderer.invoke('cutiepie:settings:load'),
    save: (payload) => ipcRenderer.invoke('cutiepie:settings:save', payload),
    clear: () => ipcRenderer.invoke('cutiepie:settings:clear')
  }
});
