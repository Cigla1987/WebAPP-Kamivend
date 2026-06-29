import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '../db';
import { serverEnv } from '#/config/env.ts';
import { organization, admin } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { UserRole } from '#/shared/enums';
import { Resend } from 'resend';

const env = serverEnv();

const resend = new Resend(env.RESEND_API_KEY);

const statements = {
  machine: ['create', 'read', 'update', 'delete', 'assign'],
  product: ['create', 'read', 'update', 'delete'],
  compartment: ['read', 'update', 'stock'],
  picture: ['create', 'read', 'update', 'delete'],
  member: ['create', 'read', 'update', 'delete'],
  invitation: ['create', 'read', 'update', 'delete'],
} as const;

const ac = createAccessControl(statements);

const owner = ac.newRole({
  machine: ['create', 'read', 'update', 'delete', 'assign'],
  product: ['create', 'read', 'update', 'delete'],
  compartment: ['read', 'update', 'stock'],
  picture: ['create', 'read', 'update', 'delete'],
  member: ['create', 'read', 'update', 'delete'],
  invitation: ['create', 'read', 'update', 'delete'],
});

const employee = ac.newRole({
  machine: ['read'],
  product: ['read'],
  compartment: ['read', 'update', 'stock'],
  picture: ['read'],
  member: ['read'],
  invitation: ['read'],
});

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
      defaultRole: UserRole.User,
      adminRoles: [UserRole.Admin],
    }),
    organization({
      ac,
      roles: { owner, employee },
      async sendInvitationEmail(data) {
        const inviteLink = `${env.BETTER_AUTH_URL}/invite/accept/${data.id}`;
        console.log('Sending email...', resend, data);
        await resend.emails.send({
          from: env.EMAIL_FROM,
          to: data.email,
          subject: `You've been invited to join ${data.organization.name}`,
          html: `
            <p>You've been invited to join <strong>${data.organization.name}</strong> by ${data.inviter.user.name}.</p>
            <p>Click the link below to accept the invitation:</p>
            <a href="${inviteLink}">${inviteLink}</a>
          `,
        });
        console.log('Sent email.');
      },
    }),
    tanstackStartCookies(),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(options);
