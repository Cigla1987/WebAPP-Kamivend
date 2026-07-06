import { app, BrowserWindow, globalShortcut, ipcMain, shell } from 'electron';
import path from 'node:path';
import Store from 'electron-store';
import { config } from 'dotenv';

// Load .env from the app root directory (works in dev and production)
config({ path: path.join(app.getAppPath(), '.env') });

let allowQuit = true;

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
    // kiosk: !process.env.ELECTRON_RENDERER_URL,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    mainWindow.on('close', (event) => {
      if (!allowQuit) {
        event.preventDefault();
      }
    });
    // mainWindow.webContents.on('devtools-opened', () => {
    //   mainWindow.webContents.closeDevTools();
    // });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
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

  ipcMain.handle(
    'auth:signIn',
    async (_event, { email, password }: { email: string; password: string }) => {
      const apiUrl = store.get('apiUrl');
      const apiOrigin = new URL(apiUrl).origin;

      const response = await fetch(`${apiUrl}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: apiOrigin,
        },
        credentials: 'omit',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Login failed' }));
        return { error: errorData, data: null };
      }

      const authToken = response.headers.get('set-auth-token');
      if (authToken) {
        store.set('token', authToken);
      }

      const data = await response.json();
      return { data, error: null };
    },
  );

  ipcMain.handle('auth:getSession', async () => {
    const apiUrl = store.get('apiUrl');
    const apiOrigin = new URL(apiUrl).origin;
    const token = store.get('token');

    if (!token) {
      return { data: null, error: null };
    }

    const response = await fetch(`${apiUrl}/api/auth/get-session`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: apiOrigin,
      },
      credentials: 'omit',
    });

    if (!response.ok) {
      return { data: null, error: null };
    }

    const data = await response.json();
    return { data, error: null };
  });

  ipcMain.handle('auth:signOut', async () => {
    const apiUrl = store.get('apiUrl');
    const apiOrigin = new URL(apiUrl).origin;
    const token = store.get('token');

    if (token) {
      await fetch(`${apiUrl}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Origin: apiOrigin,
        },
        credentials: 'omit',
      });
    }

    store.delete('token');
    return { data: null, error: null };
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
