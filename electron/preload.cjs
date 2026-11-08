const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kotiUpdater', {
  getVersion: () => ipcRenderer.invoke('koti:app-version'),
  check: () => ipcRenderer.invoke('koti:update-check'),
  install: () => ipcRenderer.invoke('koti:update-install'),
  apply: () => ipcRenderer.invoke('koti:update-apply'),
});
