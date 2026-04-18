import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as myschema from './schema';
import { serverEnv } from '#/config/env.ts';

const env = serverEnv();
const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema: myschema });
