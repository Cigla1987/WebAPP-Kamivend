import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { organization, user } from "@vending/auth/schema";
import { smartFridgeProfiles } from "./smartfridge";

export const smartFridgePairingCodes = pgTable(
  "smart_fridge_pairing_codes",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    smartFridgeId: uuid("smart_fridge_id")
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: "cascade" }),
    codeHash: varchar("code_hash", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("uq_smart_pairing_code_hash").on(t.codeHash),
    index("idx_smart_pairing_code_fridge").on(t.smartFridgeId),
  ],
);

export const smartFridgeDeviceCredentials = pgTable(
  "smart_fridge_device_credentials",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    smartFridgeId: uuid("smart_fridge_id")
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: "cascade" }),
    deviceName: varchar("device_name", { length: 120 }),
    credentialHash: varchar("credential_hash", { length: 64 }).notNull(),
    credentialPrefix: varchar("credential_prefix", { length: 16 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    pairedAt: timestamp("paired_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
    appVersion: varchar("app_version", { length: 40 }),
    databaseSchemaVersion: varchar("database_schema_version", { length: 40 }),
    protocolMajor: integer("protocol_major"),
    protocolMinor: integer("protocol_minor"),
    canStatus: varchar("can_status", { length: 40 }),
    detectedShelfCount: integer("detected_shelf_count"),
    pendingSyncCount: integer("pending_sync_count"),
    credentialRotatedAt: timestamp("credential_rotated_at", {
      withTimezone: true,
    }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("uq_smart_device_credential_hash").on(t.credentialHash),
    index("idx_smart_device_fridge").on(t.smartFridgeId),
  ],
);

export const organizationServiceCredentials = pgTable(
  "organization_service_credentials",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 30 }).notNull(),
    permissions: jsonb("permissions").notNull().default([]),
    pinVerifier: varchar("pin_verifier", { length: 128 }).notNull(),
    pinSalt: varchar("pin_salt", { length: 64 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    offlineAuthorizedUntil: timestamp("offline_authorized_until", {
      withTimezone: true,
    }).notNull(),
    authorizationVersion: integer("authorization_version").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("uq_org_service_user").on(t.organizationId, t.userId),
    index("idx_org_service_updated").on(t.organizationId, t.updatedAt),
  ],
);

export const smartFridgePushReceipts = pgTable(
  "smart_fridge_push_receipts",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    edgeDeviceId: uuid("edge_device_id")
      .notNull()
      .references(() => smartFridgeDeviceCredentials.id, {
        onDelete: "cascade",
      }),
    smartFridgeId: uuid("smart_fridge_id")
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: "cascade" }),
    eventId: varchar("event_id", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 120 }).notNull(),
    operation: varchar("operation", { length: 20 }).notNull(),
    payload: jsonb("payload"),
    accepted: boolean("accepted").notNull(),
    rejectionReason: text("rejection_reason"),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("uq_smart_push_event").on(t.edgeDeviceId, t.eventId)],
);

export const smartFridgePullChanges = pgTable(
  "smart_fridge_pull_changes",
  {
    cursor: bigint("cursor", { mode: "bigint" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    smartFridgeId: uuid("smart_fridge_id")
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 120 }).notNull(),
    operation: varchar("operation", { length: 20 }).notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("idx_smart_pull_fridge_cursor").on(t.smartFridgeId, t.cursor)],
);
