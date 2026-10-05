import { app, BrowserWindow } from 'electron';
import path from 'path';

process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - SystemJS interoperability
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Hide the menu bar
  win.setMenuBarVisibility(false);

  // Prevent opening new windows (e.g., from middle-clicking links or target="_blank")
  win.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs or drops
  win.webContents.on('will-navigate', (event, url) => {
    // allow hot-reload in dev
    if (VITE_DEV_SERVER_URL && url.startsWith(VITE_DEV_SERVER_URL)) return;
    event.preventDefault();
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

import { registerIpcHandlers } from './ipc/handlers';

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});
