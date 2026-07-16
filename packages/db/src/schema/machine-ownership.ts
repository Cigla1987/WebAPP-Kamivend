import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';
import { organization, user } from '@vending/auth/schema';
import { machines } from './vending';

/**
 * One-time activation codes used by an organization owner to claim a purchased
 * machine. Only a SHA-256 hash is stored; the raw code is shown once when the
 * platform administrator creates the machine.
 */
export const machineClaimCodes = pgTable(
  'machine_claim_codes',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    machineId: uuid('machine_id')
      .notNull()
      .references(() => machines.id, { onDelete: 'cascade' }),
    codeHash: varchar('code_hash', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    usedBy: text('used_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    usedOrganizationId: text('used_organization_id').references(
      () => organization.id,
      { onDelete: 'set null' }
    ),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('uq_machine_claim_code_hash').on(table.codeHash),
    index('idx_machine_claim_code_machine').on(table.machineId),
    index('idx_machine_claim_code_expiry').on(table.expiresAt),
  ]
);
