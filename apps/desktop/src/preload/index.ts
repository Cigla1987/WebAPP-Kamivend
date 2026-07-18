import { setupRenderer } from '@better-auth/electron/preload';
import { contextBridge, ipcRenderer } from 'electron';

setupRenderer();

export interface BoundMachine {
  id: number;
  cloud_machine_id: string;
  serial_number: string;
  machine_name: string;
  organization_id: string | null;
  machine_type: 'smartfridge';
  last_validated_at: string | null;
}

export interface DesktopAPI {
  store: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  machine: {
    getBound: () => Promise<BoundMachine | undefined>;
    bindSmartfridge: (input: {
      cloudMachineId: string;
      serialNumber: string;
      machineName: string;
      organizationId?: string | null;
      machineType: 'smartfridge';
    }) => Promise<BoundMachine>;
  };
  auth: {
    signInEmail: (credentials: { email: string; password: string }) => Promise<{
      data: unknown;
      error: unknown;
    }>;
    getSession: () => Promise<{ data: unknown; error: unknown }>;
    signOut: () => Promise<{ data: unknown; error: unknown }>;
  };
  log: {
    onLog: (callback: (level: string, message: string) => void) => void;
  };
  quit: () => Promise<void>;
}

const api: DesktopAPI = {
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key),
  },
  machine: {
    getBound: () => ipcRenderer.invoke('machine:getBound'),
    bindSmartfridge: (input) =>
      ipcRenderer.invoke('machine:bindSmartfridge', input),
  },
  auth: {
    signInEmail: (credentials) =>
      ipcRenderer.invoke('auth:signInEmail', credentials),
    getSession: () => ipcRenderer.invoke('auth:getSession'),
    signOut: () => ipcRenderer.invoke('auth:signOut'),
  },
  log: {
    onLog: (callback) => {
      ipcRenderer.on('log', (_event, level: string, message: string) => {
        callback(level, message);
      });
    },
  },
  quit: () => ipcRenderer.invoke('app:quit'),
};

contextBridge.exposeInMainWorld('desktop', api);
