import {
  date,
  decimal,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';
import { user } from './auth';

export const symbols = pgTable('symbols', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  symbolName: varchar('symbol_name', { length: 50 }).notNull(),
  symbolPicture: text('symbol_picture').notNull(),
  ownerId: text('owner_id').references(() => user.id, {
    onDelete: 'restrict',
  }),
});

export const machineTypes = pgTable('machine_types', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  machineTypeName: varchar('machine_type_name', { length: 50 })
    .notNull()
    .unique(),
});

export const machineModes = pgTable('machine_modes', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  machineModeName: varchar('machine_mode_name', { length: 50 }),
});

export const machines = pgTable('machines', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  machineName: varchar('machine_name', { length: 100 }).notNull(),
  serialNumber: varchar('serial_number', { length: 100 }).notNull().unique(),
  productionYear: integer('production_year').notNull(),
  compartmentCount: integer('compartment_count').notNull(),
  machineDateCreated: timestamp('machine_date_created', {
    withTimezone: true,
  }).defaultNow(),
  latitude: decimal('latitude', { precision: 9, scale: 6 }),
  longitude: decimal('longitude', { precision: 9, scale: 6 }),
  machineModeId: uuid('machine_mode_id').references(() => machineModes.id, {
    onDelete: 'restrict',
  }),
  machineTypeId: uuid('machine_type_id')
    .notNull()
    .references(() => machineTypes.id, { onDelete: 'restrict' }),
  ownerId: text('owner_id').references(() => user.id, {
    onDelete: 'restrict',
  }),
});

export const units = pgTable('units', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  unitName: varchar('unit_name', { length: 20 }).notNull().unique(),
  unitSymbol: varchar('unit_symbol', { length: 3 }).notNull(),
});

export const currencies = pgTable('currencies', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  currencyName: varchar('currency_name', { length: 20 }).notNull().unique(),
  currencySymbol: varchar('currency_symbol', { length: 1 }).notNull(),
});

export const pictures = pgTable('pictures', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  pictureName: varchar('picture_name', { length: 255 }).notNull(),
  pictureContent: text('picture_content'),
  pictureDateCreated: timestamp('picture_date_created', {
    withTimezone: true,
  }).defaultNow(),
  pictureOwnerId: text('picture_owner_id').references(() => user.id, {
    onDelete: 'cascade',
  }),
});

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    productName: varchar('product_name', { length: 100 }).notNull(),
    defaultPrice: numeric('default_price', {
      precision: 10,
      scale: 2,
    }).notNull(),
    defaultCurrencyId: uuid('default_currency_id')
      .notNull()
      .references(() => currencies.id, { onDelete: 'restrict' }),
    defaultQuantity: decimal('default_quantity', {
      precision: 10,
      scale: 2,
    }).notNull(),
    defaultUnitId: uuid('default_unit_id')
      .notNull()
      .references(() => units.id, { onDelete: 'restrict' }),
    productDateCreated: timestamp('product_date_created', {
      withTimezone: true,
    }).defaultNow(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    productPictureId: uuid('product_picture_id').references(
      () => pictures.id,
      {
        onDelete: 'set null',
      }
    ),
    productSymbolId: uuid('product_symbol_id').references(() => symbols.id, {
      onDelete: 'restrict',
    }),
    discountValue: integer('discount_value'),
    discountDay: integer('discount_day'),
    lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    {
      uniqueProduct: {
        name: 'unique_product_name_owner_quantity',
        columns: [table.productName, table.ownerId, table.defaultQuantity],
      },
    },
  ]
);

export const compartments = pgTable(
  'compartments',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    machineId: uuid('machine_id')
      .notNull()
      .references(() => machines.id, { onDelete: 'cascade' }),
    compartmentNumber: integer('compartment_number').notNull(),
    width: integer('width').notNull().default(200),
    height: integer('height').notNull().default(400),
    managedBy: text('managed_by'),
    productId: uuid('product_id'),
    productName: varchar('product_name', { length: 100 }),
    currentPrice: numeric('current_price', { precision: 10, scale: 2 }),
    currencySymbol: varchar('currency_symbol', { length: 10 }),
    currentQuantity: decimal('current_quantity', { precision: 10, scale: 2 }),
    unitName: varchar('unit_name', { length: 20 }),
    discountValue: integer('discount_value'),
    discountDay: integer('discount_day'),
    compartmentDateCreated: timestamp('compartment_date_created', {
      withTimezone: true,
    }).defaultNow(),
    expirationDate: date('expiration_date'),
    lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    {
      uniqueCompartment: {
        name: 'unique_machine_compartment',
        columns: [table.machineId, table.compartmentNumber],
      },
    },
    index('idx_compartments_machine_id').on(table.machineId),
  ]
);

export const smartfridges = pgTable('smartfridges', {
  id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
  machineId: uuid('machine_id')
    .notNull()
    .references(() => machines.id, { onDelete: 'cascade' }),
  count: integer('count'),
  productName: varchar('product_name', { length: 100 }),
  currentPrice: numeric('current_price', { precision: 10, scale: 2 }),
  currencySymbol: varchar('currency_symbol', { length: 10 }),
  currentQuantity: decimal('current_quantity', { precision: 10, scale: 2 }),
  unitName: varchar('unit_name', { length: 20 }),
  expirationDate: date('expiration_date'),
  productId: uuid('product_id').references(() => products.id, {
    onDelete: 'restrict',
  }),
});
