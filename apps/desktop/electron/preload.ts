import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronApi', {
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('notification:show', { title, body }),
  getPowerStatus: () => ipcRenderer.invoke('power:get-status'),
  onTrayAction: (callback: (action: string) => void) => {
    ipcRenderer.on('tray:action', (_event, action) => callback(action));
  },
  onPowerChanged: (callback: (data: { isOnBattery: boolean }) => void) => {
    ipcRenderer.on('power:changed', (_event, data) => callback(data));
  },
  onSystemSuspend: (callback: () => void) => {
    ipcRenderer.on('system:suspend', () => callback());
  },
  onSystemResume: (callback: () => void) => {
    ipcRenderer.on('system:resume', () => callback());
  },
});
