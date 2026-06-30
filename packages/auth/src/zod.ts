import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user, session } from './schema';

export const selectUserSchema = createSelectSchema(user);
export const selectSessionSchema = createSelectSchema(session);

export type User = z.infer<typeof selectUserSchema>;
export type Session = z.infer<typeof selectSessionSchema>;
