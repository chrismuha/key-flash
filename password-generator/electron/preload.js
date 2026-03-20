const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('passwordGeneratorApi', {
  platform: process.platform
});
