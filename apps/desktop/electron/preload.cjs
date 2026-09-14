const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  showNotification: (title, body) =>
    ipcRenderer.invoke('notification:show', { title, body }),
  getPowerStatus: () => ipcRenderer.invoke('power:get-status'),
  onTrayAction: (callback) => {
    ipcRenderer.on('tray:action', (_event, action) => callback(action));
  },
  onPowerChanged: (callback) => {
    ipcRenderer.on('power:changed', (_event, data) => callback(data));
  },
  onSystemSuspend: (callback) => {
    ipcRenderer.on('system:suspend', () => callback());
  },
  onSystemResume: (callback) => {
    ipcRenderer.on('system:resume', () => callback());
  },
});
