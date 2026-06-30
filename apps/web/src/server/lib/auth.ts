import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '../db';
import { serverEnv } from '#/config/env.ts';
import { Resend } from 'resend';
import { createAuthOptions } from '@vending/auth';

const env = serverEnv();

const resend = new Resend(env.RESEND_API_KEY);

const options = createAuthOptions(db, {
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  nodeEnv: env.NODE_ENV,
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
});

export const auth = betterAuth({
  ...options,
  plugins: [...(options.plugins ?? []), bearer(), tanstackStartCookies()],
});
