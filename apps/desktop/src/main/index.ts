import { app, BrowserWindow, globalShortcut, ipcMain, shell } from 'electron';
import path from 'node:path';
import Store from 'electron-store';
import { config } from 'dotenv';
import { createElectronAuthClient } from './lib/auth-client';
import {
  bindSmartfridgeMachine,
  closeLocalDatabase,
  getBoundMachine,
  getLocalDatabase,
} from './lib/local-db';

const envPath = app.isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join(app.getAppPath(), '.env');

const dotenvResult = config({ path: envPath });
if (dotenvResult.error) {
  console.warn('[Main] Failed to load .env file:', dotenvResult.error.message);
}

const apiUrl = process.env.VENDING_API_URL ?? 'http://localhost:3000';
const { authClient } = createElectronAuthClient(apiUrl);
authClient.setupMain();

let allowQuit = true;
let mainWindow: BrowserWindow | null = null;

const store = new Store<{ apiUrl: string }>({
  defaults: { apiUrl },
});

function sendToRendererLog(level: 'log' | 'error' | 'warn', message: string) {
  console[level](message);
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
      if (!allowQuit) event.preventDefault();
    });
  }

  win.webContents.on('did-finish-load', () => {
    console.log('[Main] Renderer finished loading');
    void win.webContents.executeJavaScript(
      "({ text: document.body.innerText, html: document.body.innerHTML })",
    ).then((dom) => console.log('[Renderer DOM]', JSON.stringify(dom)));
    win.show();
    win.focus();
  });

  win.webContents.on('console-message', (_event, level, message) => {
    console.log('[Renderer Console]', level, message);
  });

  win.webContents.on('did-fail-load', (_event, code, description) => {
    console.error('[Main] Renderer failed to load:', code, description);
  });

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Main] Renderer process gone:', details);
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow = win;
  return win;
}

app.whenReady().then(() => {
  try {
    getLocalDatabase();
  } catch (error) {
    console.warn('[Main] Local database is unavailable:', error);
  }

  ipcMain.handle('store:get', (_event, key: keyof typeof store.store) =>
    store.get(key),
  );
  ipcMain.handle(
    'store:set',
    (_event, key: keyof typeof store.store, value: unknown) => store.set(key, value),
  );
  ipcMain.handle('store:delete', (_event, key: keyof typeof store.store) =>
    store.delete(key),
  );

  ipcMain.handle('machine:getBound', () => getBoundMachine());
  ipcMain.handle('machine:bindSmartfridge', (_event, input) =>
    bindSmartfridgeMachine(input),
  );

  ipcMain.handle('app:quit', () => {
    allowQuit = true;
    app.quit();
  });

  ipcMain.handle(
    'auth:signInEmail',
    async (_event, { email, password }: { email: string; password: string }) => {
      sendToRendererLog('log', `[Auth] Signing in: ${email}`);
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        sendToRendererLog(
          'error',
          `[Auth] Sign-in failed: ${JSON.stringify(result.error)}`,
        );
      }
      return result;
    },
  );

  ipcMain.handle('auth:getSession', async () => authClient.getSession());
  ipcMain.handle('auth:signOut', async () => authClient.signOut());


  createWindow();

  if (!process.env.ELECTRON_RENDERER_URL) {
    globalShortcut.register('Ctrl+Shift+K', () => {
      allowQuit = true;
      app.quit();
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => closeLocalDatabase());

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
