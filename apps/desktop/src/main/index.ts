import { app, BrowserWindow, globalShortcut, ipcMain, shell } from 'electron';
import path from 'node:path';
import Store from 'electron-store';
import { config } from 'dotenv';
import { createElectronAuthClient } from './lib/auth-client';

// Load .env FIRST, before creating any auth client that depends on it
const envPath = app.isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join(app.getAppPath(), '.env');

const dotenvResult = config({ path: envPath });
if (dotenvResult.error) {
  console.warn('[Main] Failed to load .env file:', dotenvResult.error.message);
}

// Create auth client AFTER dotenv has loaded
const apiUrl = process.env.VENDING_API_URL ?? 'http://localhost:3000';
const { authClient } = createElectronAuthClient(apiUrl);

// Must be called before app is ready
authClient.setupMain();

let allowQuit = true;
let mainWindow: BrowserWindow | null = null;

const store = new Store<{
  apiUrl: string;
}>({
  defaults: {
    apiUrl,
  },
});

function sendToRendererLog(level: 'log' | 'error' | 'warn', message: string) {
  // Print in main process terminal
  console[level](message);
  // Forward to renderer DevTools
  mainWindow?.webContents.send('log', level, message);
}

function createWindow() {
  const win = new BrowserWindow({
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

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
    win.on('close', (event) => {
      if (!allowQuit) {
        event.preventDefault();
      }
    });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow = win;
  return win;
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

  ipcMain.handle('app:quit', () => {
    allowQuit = true;
    app.quit();
  });

  // Auth IPC bridges delegate to the official Better Auth Electron client
  ipcMain.handle(
    'auth:signInEmail',
    async (_event, { email, password }: { email: string; password: string }) => {
      sendToRendererLog('log', `[Auth] Signing in: ${email}`);
      const result = await authClient.signIn.email({
        email,
        password,
      });
      if (result.error) {
        sendToRendererLog('error', `[Auth] Sign-in failed: ${JSON.stringify(result.error)}`);
      } else {
        sendToRendererLog('log', `[Auth] Sign-in succeeded for: ${email}`);
      }
      return result;
    },
  );

  ipcMain.handle('auth:getSession', async () => {
    sendToRendererLog('log', '[Auth] Fetching session...');
    const result = await authClient.getSession();
    if (result.data) {
      sendToRendererLog('log', `[Auth] Session found for: ${result.data.user?.email ?? 'unknown'}`);
    } else {
      sendToRendererLog('log', '[Auth] No active session');
    }
    return result;
  });

  ipcMain.handle('auth:signOut', async () => {
    sendToRendererLog('log', '[Auth] Signing out...');
    const result = await authClient.signOut();
    sendToRendererLog('log', '[Auth] Sign-out complete');
    return result;
  });

  createWindow();

  if (!process.env.ELECTRON_RENDERER_URL) {
    globalShortcut.register('Ctrl+Shift+K', () => {
      allowQuit = true;
      app.quit();
    });
  }

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
