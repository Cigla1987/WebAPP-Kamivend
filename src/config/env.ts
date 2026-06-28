import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.hex().length(64),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_NAME: z.string(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string().default('onboarding@resend.dev'),
});

export const serverEnv = () => serverEnvSchema.parse(process.env);
