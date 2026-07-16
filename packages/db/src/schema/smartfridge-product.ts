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