import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import z from 'zod';

config({ path: ['.env.local', '.env'] });

const envSchema = z.object({
  DATABASE_URL: z.url(),
});
const env = envSchema.parse(process.env);

export default defineConfig({
  out: './migrations',
  schema: '../../packages/db/src/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
