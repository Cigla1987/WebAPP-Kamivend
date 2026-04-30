import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { compartments, symbols, pictures } from '#/server/db/schema';

const decimalValue = z.string().regex(/^\d+(\.\d{1,2})?$/);

export const insertCompartmentSchema = createInsertSchema(compartments, {
  compartmentNumber: z.number().min(1).max(100),
  width: z.number().min(100).max(1000).default(200),
  height: z.number().min(100).max(1000).default(400),
  currentPrice: decimalValue.optional(),
  currentQuantity: decimalValue.optional(),
});

export const selectCompartmentSchema = createSelectSchema(compartments);
export const updateCompartmentSchema = createUpdateSchema(compartments);

export const compartmentFormSchema = insertCompartmentSchema.omit({
  id: true,
  compartmentDateCreated: true,
  lastUpdated: true,
});

export const createCompartmentApiSchema = insertCompartmentSchema;
export const updateCompartmentApiSchema = updateCompartmentSchema.partial();

export const insertSymbolSchema = createInsertSchema(symbols);
export const selectSymbolSchema = createSelectSchema(symbols);
export const updateSymbolSchema = createUpdateSchema(symbols);

export const insertPictureSchema = createInsertSchema(pictures);
export const selectPictureSchema = createSelectSchema(pictures);
export const updatePictureSchema = createUpdateSchema(pictures);
