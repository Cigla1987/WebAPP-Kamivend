import {
  createSelectSchema,
  // createInsertSchema,
  // createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { user } from '#/server/db/schema';

const selectUserSchema = createSelectSchema(user);

export type User = z.infer<typeof selectUserSchema>;
