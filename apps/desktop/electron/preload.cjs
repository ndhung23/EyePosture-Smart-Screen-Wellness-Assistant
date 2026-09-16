const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  getSqlWasmBinary: () => ipcRenderer.invoke('sqlite:get-wasm-binary'),
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
  setTrayLanguage: (lang) => ipcRenderer.send('tray:set-language', lang),
  onRequestQuit: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('app:request-quit', listener);
    return () => {
      ipcRenderer.removeListener('app:request-quit', listener);
    };
  },
  confirmQuit: () => ipcRenderer.send('app:confirm-quit'),
  requestAppQuit: () => ipcRenderer.send('app:request-quit'),
});
