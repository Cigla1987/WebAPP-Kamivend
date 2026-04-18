import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '../db';
import { serverEnv as env } from '#/config/env.ts';
import { admin, customSession } from 'better-auth/plugins';
import { ac, employee, owner, superadmin } from '../utils/permissions.server';

const options = {
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 24,
    cookieCache: {
      enabled: true,
      strategy: 'jwe',
      maxAge: 60 * 1000,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'employee',
        input: false,
      },
      ownerId: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === 'production',
    cookies: {
      session_token: {
        name: 'vending_session',
      },
    },
  },
  plugins: [
    admin({
      ac,
      defaultRole: 'owner',
      adminRoles: ['superadmin'],
      roles: { owner, superadmin, employee },
    }),
    tanstackStartCookies(),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user }) => {
      return {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      };
    }, options),
  ],
});
