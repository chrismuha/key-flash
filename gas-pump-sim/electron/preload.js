const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('pumpApp', {
  platform: process.platform,
});
