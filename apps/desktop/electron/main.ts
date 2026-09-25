import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, powerMonitor, Notification, session, screen, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import os from 'os';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import { spawn } from 'child_process';
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
let overlayWindow: BrowserWindow | null = null;
let overlayHideTimer: NodeJS.Timeout | null = null;
let tray: Tray | null = null;
let isQuitting = false;

function getOverlayHtmlPath(): string {
  const candidates = [
    path.join(__dirname, 'overlay.html'),
    path.join(__dirname, '../electron/overlay.html'),
    path.join(__dirname, '../../electron/overlay.html'),
    path.join(process.cwd(), 'apps/desktop/electron/overlay.html'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(__dirname, 'overlay.html');
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 460,
    height: 110,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const overlayHtml = getOverlayHtmlPath();
  overlayWindow.loadFile(overlayHtml);

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function showOverlayAlert(data: { type: string; title: string; message: string; durationMs?: number }) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    createOverlayWindow();
  }

  if (overlayHideTimer) {
    clearTimeout(overlayHideTimer);
    overlayHideTimer = null;
  }

  try {
    const cursor = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(cursor) || screen.getPrimaryDisplay();
    const { width, height, x, y } = display.bounds;
    const overlayW = 460;
    const overlayH = 110;
    overlayWindow?.setBounds({
      x: Math.round(x + (width - overlayW) / 2),
      y: Math.round(y + 36), // Căn giữa phía trên đỉnh màn hình (cách mép trên 36px)
      width: overlayW,
      height: overlayH,
    });
  } catch (err) {
    console.warn('Failed to calculate overlay bounds:', err);
  }

  overlayWindow?.webContents.send('alert:show', data);
  overlayWindow?.showInactive();

  const duration = data.durationMs || 4500;
  overlayHideTimer = setTimeout(() => {
    hideOverlayAlert();
  }, duration);
}

function hideOverlayAlert() {
  if (overlayHideTimer) {
    clearTimeout(overlayHideTimer);
    overlayHideTimer = null;
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('alert:hide');
    setTimeout(() => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.hide();
      }
    }, 300);
  }
}

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
    // Filter out internal WebAssembly, MediaPipe, WebGL, and high-frequency logs
    const msg = (message || '').toLowerCase();
    const src = (sourceId || '').toLowerCase();
    if (
      src.includes('wasm') ||
      src.includes('vision') ||
      src.includes('mediapipe') ||
      msg.includes('vision_wasm') ||
      msg.includes('gl_') ||
      msg.includes('emscripten') ||
      msg.includes('facelandmarker') ||
      msg.includes('tensorflow') ||
      msg.includes('tflite') ||
      msg.includes('webgl')
    ) {
      return;
    }
    if (level >= 3) {
      console.error(`[Renderer Error]: ${message} (${sourceId}:${line})`);
    }
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

    updateTrayMenu('vi');
    tray.on('double-click', () => {
      mainWindow?.show();
      mainWindow?.focus();
    });
  } catch (err) {
    console.warn('System tray could not be initialized:', err);
  }
}

function updateTrayMenu(lang: string = 'vi') {
  if (!tray) return;
  const isVi = lang === 'vi';
  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVi ? 'Mở bảng điều khiển EyePosture' : 'Open EyePosture Dashboard',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: isVi ? 'Tạm dừng giám sát' : 'Pause Monitoring',
      click: () => {
        mainWindow?.webContents.send('tray:action', 'pause');
      },
    },
    {
      label: isVi ? 'Tiếp tục giám sát' : 'Resume Monitoring',
      click: () => {
        mainWindow?.webContents.send('tray:action', 'resume');
      },
    },
    { type: 'separator' },
    {
      label: isVi ? 'Nghỉ mắt ngay (20-20-20)' : 'Take an Eye Break (20-20-20)',
      click: () => {
        mainWindow?.webContents.send('tray:action', 'take-break');
      },
    },
    {
      label: isVi ? 'Ghi nhận uống nước' : 'Log Water Glass',
      click: () => {
        mainWindow?.webContents.send('tray:action', 'log-water');
      },
    },
    { type: 'separator' },
    {
      label: isVi ? 'Thoát EyePosture' : 'Quit EyePosture',
      click: () => {
        requestQuitFromElectron();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
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

ipcMain.on('tray:set-language', (_event, lang) => {
  updateTrayMenu(lang);
});

ipcMain.on('app:confirm-quit', () => {
  isQuitting = true;
  app.quit();
});

ipcMain.on('overlay:show', (_event, data) => {
  showOverlayAlert(data);
});

ipcMain.on('overlay:dismiss', () => {
  hideOverlayAlert();
});

ipcMain.on('app:request-quit', () => {
  requestQuitFromElectron();
});

ipcMain.handle('app:get-version', () => {
  return app.getVersion() || '1.0.0';
});

ipcMain.handle('shell:open-external', (_event, targetUrl: string) => {
  if (targetUrl && (targetUrl.startsWith('https://') || targetUrl.startsWith('http://'))) {
    shell.openExternal(targetUrl);
    return true;
  }
  return false;
});

function downloadFileWithRedirects(
  targetUrl: string,
  destPath: string,
  onProgress?: (p: { percent: number; receivedBytes: number; totalBytes: number }) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.get(targetUrl, (res) => {
        if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          return resolve(downloadFileWithRedirects(res.headers.location, destPath, onProgress));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed with status: ${res.statusCode}`));
        }

        const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
        let receivedBytes = 0;
        const fileStream = fs.createWriteStream(destPath);

        res.on('data', (chunk) => {
          receivedBytes += chunk.length;
          if (totalBytes > 0 && onProgress) {
            const percent = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
            onProgress({ percent, receivedBytes, totalBytes });
          }
        });

        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => resolve());
        });

        fileStream.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      });

      req.on('error', reject);
      req.setTimeout(60000, () => {
        req.destroy(new Error('Download timeout'));
      });
    } catch (err) {
      reject(err);
    }
  });
}

ipcMain.handle('updater:download-and-install', async (event, downloadUrl: string) => {
  try {
    const tempDir = app.getPath('temp');
    const installerPath = path.join(tempDir, 'EyePosture-Setup-Update.exe');

    await downloadFileWithRedirects(downloadUrl, installerPath, (progress) => {
      try {
        event.sender.send('updater:download-progress', progress);
      } catch {}
    });

    // Launch installer and cleanly exit current process
    setTimeout(() => {
      try {
        const child = spawn(installerPath, [], {
          detached: true,
          stdio: 'ignore',
        });
        child.unref();
        isQuitting = true;
        app.quit();
      } catch (err) {
        console.error('Failed to spawn installer:', err);
      }
    }, 1200);

    return { success: true };
  } catch (err: any) {
    console.error('Download update error:', err);
    return { success: false, error: err.message };
  }
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

  setupAppMenu();
  createWindow();
  createOverlayWindow();
  createTray();
  setupPowerMonitoring();
  setupDeviceTelemetry();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function requestQuitFromElectron() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('app:request-quit');
  } else {
    isQuitting = true;
    app.quit();
  }
}

function setupAppMenu() {
  const isMac = process.platform === 'darwin';
  const template: any[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              {
                label: 'Quit ' + app.name,
                accelerator: 'Command+Q',
                click: () => {
                  requestQuitFromElectron();
                },
              },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            requestQuitFromElectron();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow?.hide();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Device Telemetry & Cloud Presence Heartbeat
function getOrCreateDeviceFingerprint(): string {
  try {
    const userData = app.getPath('userData');
    const idFile = path.join(userData, 'device-fingerprint.txt');
    if (fs.existsSync(idFile)) {
      const saved = fs.readFileSync(idFile, 'utf8').trim();
      if (saved) return saved;
    }
    const cleanHost = (os.hostname() || 'pc').toLowerCase().replace(/[^a-z0-9]/g, '');
    const newId = `win_${cleanHost}_${crypto.randomUUID().slice(0, 8)}`;
    fs.mkdirSync(userData, { recursive: true });
    fs.writeFileSync(idFile, newId, 'utf8');
    return newId;
  } catch {
    return `win_${(os.hostname() || 'pc').toLowerCase()}`;
  }
}

function sendDeviceTelemetry() {
  try {
    const fingerprint = getOrCreateDeviceFingerprint();
    const username = os.userInfo?.()?.username || 'User';
    const payload = JSON.stringify({
      deviceFingerprint: fingerprint,
      deviceName: `${os.hostname()} (${username})`,
      os: `${process.platform === 'win32' ? 'Windows' : process.platform} ${os.release()}`,
      appVersion: app.getVersion() || '1.0.0',
    });

    const targets = [
      process.env.EYEPOSTURE_API_URL || 'https://eyeposture.vercel.app',
      'http://localhost:8080',
    ];

    for (const apiBase of targets) {
      try {
        const targetUrl = new URL('/api/v1/devices/telemetry', apiBase);
        const client = targetUrl.protocol === 'https:' ? https : http;

        const req = client.request(
          targetUrl,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            },
            timeout: 6000,
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                const parsed = JSON.parse(data);
                if (parsed.isBlocked) {
                  console.warn('[Telemetry] This device is blocked by administrator');
                  if (Notification.isSupported()) {
                    new Notification({
                      title: 'EyePosture - Thông Báo Quản Trị',
                      body: 'Thiết bị của bạn đang bị khóa bởi quản trị viên hệ thống.',
                    }).show();
                  }
                }
              } catch {}
            });
          }
        );

        req.on('error', () => {
          // Ignore offline/unreachable servers
        });
        req.write(payload);
        req.end();
      } catch {}
    }
  } catch {
    // Silently ignore
  }
}

function setupDeviceTelemetry() {
  setTimeout(() => {
    sendDeviceTelemetry();
  }, 3000);

  setInterval(() => {
    sendDeviceTelemetry();
  }, 5 * 60 * 1000);
}

app.on('before-quit', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    requestQuitFromElectron();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
