import {
  boolean,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { products } from './vending';

/**
 * Optional SmartFridge recognition metadata for a shared product.
 *
 * Lockbox products continue to use the normal products table without needing
 * weight data. A product only receives a row here when it can be recognized
 * by a SmartFridge shelf.
 *
 * Protocol-relevant weights use integer decigrams (0.1 g units):
 * 500.0 g = 5000.
 */
export const smartFridgeProductProfiles = pgTable(
  'smart_fridge_product_profiles',
  {
    id: uuid('id').primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sku: varchar('sku', { length: 100 }),
    barcode: varchar('barcode', { length: 100 }),
    nominalWeightDg: integer('nominal_weight_dg').notNull(),
    matchingToleranceDg: integer('matching_tolerance_dg').notNull(),
    maximumMultiple: integer('maximum_multiple').notNull().default(20),
    enabled: boolean('enabled').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_smart_fridge_product_profile_product').on(table.productId),
    index('idx_smart_fridge_product_profile_enabled').on(table.enabled),
    index('idx_smart_fridge_product_profile_sku').on(table.sku),
    index('idx_smart_fridge_product_profile_barcode').on(table.barcode),
  ]
);
