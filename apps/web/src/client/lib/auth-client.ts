import { createAuthClient } from 'better-auth/react';
import type { auth } from '#/server/lib/auth';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import { organizationClient } from 'better-auth/client/plugins';

const authClient = createAuthClient({
  baseURL: import.meta.env.PROD ? 'https://app.kamivend.com' : undefined,
  plugins: [inferAdditionalFields<typeof auth>(), organizationClient()],
});

export default authClient;
