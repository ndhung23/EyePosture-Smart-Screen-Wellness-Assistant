import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, powerMonitor, Notification, session } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedWasmBinary: Uint8Array | null = null;

function loadWasmBinary(): Uint8Array | null {
  if (cachedWasmBinary) return cachedWasmBinary;
  const candidates = [
    path.join(__dirname, '../dist/sql-wasm.wasm'),
    path.join(__dirname, 'sql-wasm.wasm'),
    path.join(__dirname, '../../public/sql-wasm.wasm'),
    path.join(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm'),
    path.join(__dirname, '../../../node_modules/sql.js/dist/sql-wasm.wasm'),
    path.join(process.resourcesPath || '', 'app/dist/sql-wasm.wasm'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        const buf = fs.readFileSync(c);
        cachedWasmBinary = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
        return cachedWasmBinary;
      } catch (err) {
        console.warn('Failed to read wasm candidate:', c, err);
      }
    }
  }
  return null;
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

function getAppIcon(): string | undefined {
  const candidates = [
    path.join(__dirname, 'EyePosture.ico'),
    path.join(__dirname, 'icon.png'),
    path.join(__dirname, 'EyePosture.png'),
    path.join(__dirname, '../public/EyePosture.ico'),
    path.join(__dirname, '../../public/EyePosture.ico'),
    path.join(process.cwd(), 'EyePosture.ico'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 650,
    frame: true,
    icon: getAppIcon(),
    titleBarStyle: 'default',
    backgroundColor: '#0b0f19',
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false,
    },
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer L${level}]: ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Renderer fail-load]: ${errorCode} - ${errorDescription} (${validatedURL})`);
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
    const iconCandidates = [
      path.join(__dirname, 'icon.png'),
      path.join(__dirname, 'EyePosture.png'),
      path.join(__dirname, 'EyePosture.ico'),
      path.join(__dirname, '../public/icon.png'),
    ];
    let icon = nativeImage.createEmpty();
    for (const c of iconCandidates) {
      if (fs.existsSync(c)) {
        icon = nativeImage.createFromPath(c);
        if (!icon.isEmpty()) break;
      }
    }
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

ipcMain.handle('sqlite:get-wasm-binary', () => {
  return loadWasmBinary();
});

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true);
      return;
    }
    callback(false);
  });

  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    return permission === 'media';
  });

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
