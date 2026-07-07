import { createAuthClient } from 'better-auth/client';
import { electronClient } from '@better-auth/electron/client';
import { storage } from '@better-auth/electron/storage';
import Store from 'electron-store';

const store = new Store<{
  apiUrl: string;
}>({
  defaults: {
    apiUrl: process.env.VENDING_API_URL ?? 'http://localhost:3000',
  },
});

const apiUrl = store.get('apiUrl');

export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [
    electronClient({
      signInURL: `${apiUrl}/login`,
      protocol: {
        scheme: 'com.vending.desktop',
      },
      storage: storage(),
    }),
  ],
});
