const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getMachineId: async () => ipcRenderer.invoke('get-machine-id')
})
