import { drizzle } from 'drizzle-orm/node-postgres';

import * as myschema from './schema';
import { serverEnv } from '#/config/env.ts';

const env = serverEnv();
export const db = drizzle(env.DATABASE_URL, { schema: myschema });
