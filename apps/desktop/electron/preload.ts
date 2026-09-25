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
  setTrayLanguage: (lang: string) => ipcRenderer.send('tray:set-language', lang),
  onRequestQuit: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('app:request-quit', listener);
    return () => {
      ipcRenderer.removeListener('app:request-quit', listener);
    };
  },
  confirmQuit: () => ipcRenderer.send('app:confirm-quit'),
  requestAppQuit: () => ipcRenderer.send('app:request-quit'),
  showOverlayAlert: (data: { type: string; title: string; message: string; durationMs?: number }) =>
    ipcRenderer.send('overlay:show', data),
  dismissOverlayAlert: () => ipcRenderer.send('overlay:dismiss'),
  onAlertShow: (callback: (data: any) => void) => {
    ipcRenderer.on('alert:show', (_event, data) => callback(data));
  },
  onAlertHide: (callback: () => void) => {
    ipcRenderer.on('alert:hide', () => callback());
  },
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),
  openExternal: (url: string) => ipcRenderer.invoke('shell:open-external', url),
  downloadAndInstallUpdate: (url: string) => ipcRenderer.invoke('updater:download-and-install', url),
  onUpdateDownloadProgress: (callback: (progress: { percent: number; receivedBytes: number; totalBytes: number }) => void) => {
    const listener = (_event: any, progress: any) => callback(progress);
    ipcRenderer.on('updater:download-progress', listener);
    return () => {
      ipcRenderer.removeListener('updater:download-progress', listener);
    };
  },
});
