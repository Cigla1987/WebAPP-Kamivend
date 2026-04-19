import { createAuthClient } from 'better-auth/react';
import type { auth } from '#/server/lib/auth';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
