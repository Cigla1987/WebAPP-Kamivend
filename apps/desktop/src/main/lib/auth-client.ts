import { createAuthClient } from 'better-auth/client';
import { electronClient } from '@better-auth/electron/client';
import { storage } from '@better-auth/electron/storage';

export function createElectronAuthClient(apiUrl: string) {
  const authClient = createAuthClient({
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

  return { authClient };
}

export type AuthClient = ReturnType<typeof createElectronAuthClient>['authClient'];
