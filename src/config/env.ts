import { createServerOnlyFn } from '@tanstack/react-start';
import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.hex().length(64),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_NAME: z.string(),
});

const _serverEnv = serverEnvSchema.parse(process.env);

export const serverEnv = createServerOnlyFn(() => _serverEnv);
