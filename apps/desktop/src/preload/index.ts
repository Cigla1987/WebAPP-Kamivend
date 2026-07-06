import { contextBridge, ipcRenderer } from 'electron';

export interface DesktopAPI {
  store: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  db: {
    query: (sql: string) => Promise<unknown[]>;
    exec: (sql: string) => Promise<void>;
  };
  auth: {
    signIn: (credentials: { email: string; password: string }) => Promise<{
      data: unknown;
      error: unknown;
    }>;
    getSession: () => Promise<{ data: unknown; error: unknown }>;
    signOut: () => Promise<{ data: unknown; error: unknown }>;
  };
  quit: () => Promise<void>;
}

const api: DesktopAPI = {
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key),
  },
  db: {
    query: (sql) => ipcRenderer.invoke('db:query', sql),
    exec: (sql) => ipcRenderer.invoke('db:exec', sql),
  },
  auth: {
    signIn: (credentials) => ipcRenderer.invoke('auth:signIn', credentials),
    getSession: () => ipcRenderer.invoke('auth:getSession'),
    signOut: () => ipcRenderer.invoke('auth:signOut'),
  },
  quit: () => ipcRenderer.invoke('app:quit'),
};

contextBridge.exposeInMainWorld('desktop', api);
