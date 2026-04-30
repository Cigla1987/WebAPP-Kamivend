import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from '#/server/db/schema';

export const insertUserSchema = createInsertSchema(user);
export const selectUserSchema = createSelectSchema(user);

export const loginSchema = z.object({
  email: z.email({ error: 'Invalid email address.' }),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters long.' })
    .max(30, { error: 'Password must be at most 30 characters long.' }),
});

export const signupSchema = z.object({
  username: z
    .string()
    .min(5, { error: 'Username must be at least 5 characters long.' })
    .max(30, { error: 'Username must be at most 30 characters long.' })
    .regex(/^[a-zA-Z0-9]+$/, {
      error: 'Username can only contain letters and numbers.',
    }),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters.')
    .regex(/[A-Z]/, 'Must contain uppercase letter.')
    .regex(/[a-z]/, 'Must contain lowercase letter.')
    .regex(/[0-9]/, 'Must contain a number.'),
  confirmPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters.')
    .regex(/[A-Z]/, 'Must contain uppercase letter.')
    .regex(/[a-z]/, 'Must contain lowercase letter.')
    .regex(/[0-9]/, 'Must contain a number.'),
  email: z.email({ error: 'Invalid email address.' }),
});
