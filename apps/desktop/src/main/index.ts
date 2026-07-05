import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import Store from 'electron-store';

const store = new Store<{
  token: string | null;
  apiUrl: string;
}>({
  defaults: {
    token: null,
    apiUrl: process.env.VENDING_API_URL ?? 'http://localhost:3000',
  },
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  ipcMain.handle('store:get', (_event, key: keyof typeof store.store) => {
    return store.get(key);
  });

  ipcMain.handle(
    'store:set',
    (_event, key: keyof typeof store.store, value: unknown) => {
      store.set(key, value);
    },
  );

  ipcMain.handle('store:delete', (_event, key: keyof typeof store.store) => {
    store.delete(key);
  });

  // Placeholder IPC handlers for SQLite (deferred until native build is ready)
  ipcMain.handle('db:query', (_event, _sql: string) => {
    throw new Error('SQLite is not wired yet (minimal setup)');
  });

  ipcMain.handle('db:exec', (_event, _sql: string) => {
    throw new Error('SQLite is not wired yet (minimal setup)');
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
