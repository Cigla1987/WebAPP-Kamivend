import {
  date,
  decimal,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

export const symbols = pgTable('symbols', {
  id: serial('id').primaryKey(),
  symbolName: varchar('symbol_name', { length: 50 }).notNull(),
  symbolPicture: text('symbol_picture').notNull(),
  ownerId: text('owner_id').references(() => user.id, {
    onDelete: 'restrict',
  }),
});

export const machineTypes = pgTable('machine_types', {
  id: serial('id').primaryKey(),
  machineTypeName: varchar('machine_type_name', { length: 50 })
    .notNull()
    .unique(),
});

export const machineModes = pgTable('machine_modes', {
  id: serial('id').primaryKey(),
  machineModeName: varchar('machine_mode_name', { length: 50 }),
});

export const machines = pgTable('machines', {
  id: serial('id').primaryKey(),
  machineName: varchar('machine_name', { length: 100 }).notNull(),
  serialNumber: varchar('serial_number', { length: 100 }).notNull().unique(),
  productionYear: integer('production_year').notNull(),
  compartmentCount: integer('compartment_count').notNull(),
  machineDateCreated: timestamp('machine_date_created', {
    withTimezone: true,
  }).defaultNow(),
  latitude: decimal('latitude', { precision: 9, scale: 6 }),
  longitude: decimal('longitude', { precision: 9, scale: 6 }),
  machineModeId: integer('machine_mode_id').references(() => machineModes.id, {
    onDelete: 'restrict',
  }),
  machineTypeId: integer('machine_type_id')
    .notNull()
    .references(() => machineTypes.id, { onDelete: 'restrict' }),
  ownerId: text('owner_id').references(() => user.id, {
    onDelete: 'restrict',
  }),
});

export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  unitName: varchar('unit_name', { length: 20 }).notNull().unique(),
  unitSymbol: varchar('unit_symbol', { length: 3 }).notNull(),
});

export const currencies = pgTable('currencies', {
  id: serial('id').primaryKey(),
  currencyName: varchar('currency_name', { length: 20 }).notNull().unique(),
  currencySymbol: varchar('currency_symbol', { length: 1 }).notNull(),
});

export const pictures = pgTable('pictures', {
  id: serial('id').primaryKey(),
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
    id: serial('id').primaryKey(),
    productName: varchar('product_name', { length: 100 }).notNull(),
    defaultPrice: numeric('default_price', {
      precision: 10,
      scale: 2,
    }).notNull(),
    defaultCurrencyId: integer('default_currency_id')
      .notNull()
      .references(() => currencies.id, { onDelete: 'restrict' }),
    defaultQuantity: decimal('default_quantity', {
      precision: 10,
      scale: 2,
    }).notNull(),
    defaultUnitId: integer('default_unit_id')
      .notNull()
      .references(() => units.id, { onDelete: 'restrict' }),
    productDateCreated: timestamp('product_date_created', {
      withTimezone: true,
    }).defaultNow(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    productPictureId: integer('product_picture_id').references(
      () => pictures.id,
      {
        onDelete: 'set null',
      }
    ),
    productSymbolId: integer('product_symbol_id').references(() => symbols.id, {
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
    id: serial('id').primaryKey(),
    machineId: integer('machine_id')
      .notNull()
      .references(() => machines.id, { onDelete: 'cascade' }),
    compartmentNumber: integer('compartment_number').notNull(),
    width: integer('width').notNull().default(200),
    height: integer('height').notNull().default(400),
    managedBy: text('managed_by'),
    productId: integer('product_id'),
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
  id: serial('id').primaryKey(),
  machineId: integer('machine_id')
    .notNull()
    .references(() => machines.id, { onDelete: 'cascade' }),
  count: integer('count'),
  productName: varchar('product_name', { length: 100 }),
  currentPrice: numeric('current_price', { precision: 10, scale: 2 }),
  currencySymbol: varchar('currency_symbol', { length: 10 }),
  currentQuantity: decimal('current_quantity', { precision: 10, scale: 2 }),
  unitName: varchar('unit_name', { length: 20 }),
  expirationDate: date('expiration_date'),
  productId: integer('product_id').references(() => products.id, {
    onDelete: 'restrict',
  }),
});
