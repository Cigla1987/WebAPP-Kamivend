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
  SMART_FRIDGE_EDGE_AUTH_SECRET: z.string().min(32),
  SMART_FRIDGE_PAIRING_CODE_TTL_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(15),
  SMART_FRIDGE_MACHINE_CLAIM_TTL_DAYS: z.coerce
    .number()
    .int()
    .positive()
    .default(365),
  SMART_FRIDGE_EDGE_LOGIN_RATE_LIMIT: z.coerce
    .number()
    .int()
    .positive()
    .default(10),
  SMART_FRIDGE_SYNC_BATCH_LIMIT: z.coerce
    .number()
    .int()
    .positive()
    .max(500)
    .default(100),
  SMART_FRIDGE_HEARTBEAT_INTERVAL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(30),
});

export const serverEnv = () => serverEnvSchema.parse(process.env);
