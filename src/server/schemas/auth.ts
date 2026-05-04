import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { session, user } from '#/server/db/schema';

const selectUserSchema = createSelectSchema(user);
const selectSessionSchema = createSelectSchema(session);

export type User = z.infer<typeof selectUserSchema>;
export type Session = z.infer<typeof selectSessionSchema>;
