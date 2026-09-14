import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, powerMonitor, Notification } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 650,
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#0b0f19',
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, 'icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.isEmpty() ? nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZklEQVQ4T2NkoBAwUqifYdQAYgz4D8TvgHgLEP9nIB38h6rFp5gBqh6bgfxlqHoYGg2YgRroQAzGf4hT/wea8B+o/h9QjQ96eBhGQeNhaDRgBmqQAzEY/yFO/R9o4n+g+n9ANT4AZ/iR/09iSsoAAAAASUVORK5CYII=') : icon);
    tray.setToolTip('EyePosture - Screen Wellness Assistant');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open EyePosture Dashboard',
        click: () => {
          mainWindow?.show();
          mainWindow?.focus();
        },
      },
    { type: 'separator' },
    {
      label: 'Pause Monitoring',
      click: () => {
        mainWindow?.webContents.send('tray:action', 'pause');
      },
    },
    {
      label: 'Resume Monitoring',
      click: () => {
        mainWindow?.webContents.send('tray:action', 'resume');
      },
    },
    { type: 'separator' },
    {
      label: 'Take an Eye Break (20-20-20)',
      click: () => {
        mainWindow?.webContents.send('tray:action', 'take-break');
      },
    },
    {
      label: 'Log Water Glass',
      click: () => {
        mainWindow?.webContents.send('tray:action', 'log-water');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      mainWindow?.show();
      mainWindow?.focus();
    });
  } catch (err) {
    console.warn('System tray could not be initialized:', err);
  }
}

// Power Monitoring (Battery / Sleep / Wake)
function setupPowerMonitoring() {
  powerMonitor.on('on-battery', () => {
    mainWindow?.webContents.send('power:changed', { isOnBattery: true });
  });

  powerMonitor.on('on-ac', () => {
    mainWindow?.webContents.send('power:changed', { isOnBattery: false });
  });

  powerMonitor.on('suspend', () => {
    mainWindow?.webContents.send('system:suspend');
  });

  powerMonitor.on('resume', () => {
    mainWindow?.webContents.send('system:resume');
  });
}

// IPC Handlers
ipcMain.handle('notification:show', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show();
    return true;
  }
  return false;
});

ipcMain.handle('power:get-status', () => {
  return {
    isOnBattery: powerMonitor.isOnBatteryPower(),
  };
});

app.whenReady().then(() => {
  createWindow();
  createTray();
  setupPowerMonitoring();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
