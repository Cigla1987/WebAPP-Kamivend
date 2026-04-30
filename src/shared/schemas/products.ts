import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { z } from 'zod';
import { products, units, currencies } from '#/server/db/schema';

const decimalPrice = z.string().regex(/^\d+(\.\d{1,2})?$/);

export const insertProductSchema = createInsertSchema(products, {
  productName: z.string().min(1).max(100),
  defaultPrice: decimalPrice,
  defaultQuantity: decimalPrice,
});

export const selectProductSchema = createSelectSchema(products);
export const updateProductSchema = createUpdateSchema(products);

export const productFormSchema = insertProductSchema.omit({
  id: true,
  ownerId: true,
  productDateCreated: true,
  lastUpdated: true,
});

export const createProductApiSchema = insertProductSchema;
export const updateProductApiSchema = updateProductSchema.partial();

export const insertUnitSchema = createInsertSchema(units);
export const selectUnitSchema = createSelectSchema(units);
export const updateUnitSchema = createUpdateSchema(units);

export const unitFormSchema = insertUnitSchema.omit({ id: true });

export const insertCurrencySchema = createInsertSchema(currencies);
export const selectCurrencySchema = createSelectSchema(currencies);
export const updateCurrencySchema = createUpdateSchema(currencies);

export const currencyFormSchema = insertCurrencySchema.omit({ id: true });
