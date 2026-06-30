import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, organization } from 'better-auth/plugins';
import { UserRole } from '@vending/domain';
import { ac, owner, employee } from './roles';

export interface InvitationEmailData {
  id: string;
  email: string;
  role: string | null;
  organization: {
    name: string;
    slug: string;
  };
  inviter: {
    user: {
      name: string;
      email: string;
    };
  };
}

export interface AuthConfig {
  secret: string;
  baseURL: string;
  nodeEnv: string;
  sendInvitationEmail: (data: InvitationEmailData) => Promise<void>;
}

export function createAuthOptions(
  db: any,
  config: AuthConfig
): BetterAuthOptions {
  return {
    secret: config.secret,
    baseURL: config.baseURL,
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    advanced: {
      useSecureCookies: config.nodeEnv === 'production',
      cookies: {
        session_token: {
          name: 'vending_session',
        },
      },
    },
    plugins: [
      admin({
        defaultRole: UserRole.User,
        adminRoles: [UserRole.Admin],
      }),
      organization({
        ac,
        roles: { owner, employee },
        sendInvitationEmail: config.sendInvitationEmail,
      }),
    ],
  };
}
