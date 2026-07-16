import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';
import { organization, user } from '@vending/auth/schema';
import { currencies, machines, products } from './vending';

export const smartFridgeServiceType = pgEnum('smart_fridge_service_type', [
  'recognition',
  'layout',
  'calibration',
  'refill',
  'diagnostics',
]);

export const smartFridgeSessionStatus = pgEnum('smart_fridge_session_status', [
  'open',
  'completed',
  'aborted',
  'failed',
]);

export const smartFridgeShoppingStatus = pgEnum('smart_fridge_shopping_status', [
  'authorized',
  'live',
  'finalizing',
  'awaiting_payment',
  'paid',
  'aborted',
  'error',
]);

export const smartFridgeProfiles = pgTable(
  'smart_fridge_profiles',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    machineId: uuid('machine_id')
      .notNull()
      .references(() => machines.id, { onDelete: 'cascade' }),
    fridgeCode: varchar('fridge_code', { length: 100 }),
    expectedShelfCount: integer('expected_shelf_count').notNull().default(0),
    canBitrate: integer('can_bitrate').notNull().default(250000),
    protocolMajor: integer('protocol_major').notNull().default(1),
    protocolMinor: integer('protocol_minor').notNull().default(3),
    timezone: varchar('timezone', { length: 100 }).notNull().default('Europe/Zagreb'),
    currencyId: uuid('currency_id').references(() => currencies.id, {
      onDelete: 'restrict',
    }),
    setupCompleted: boolean('setup_completed').notNull().default(false),
    customerOperationEnabled: boolean('customer_operation_enabled')
      .notNull()
      .default(false),
    lastOnlineAt: timestamp('last_online_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex('uq_smart_fridge_profile_machine').on(table.machineId)]
);

export const smartShelfNodes = pgTable(
  'smart_shelf_nodes',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    smartFridgeId: uuid('smart_fridge_id')
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: 'cascade' }),
    deviceUid: bigint('device_uid', { mode: 'bigint' }).notNull(),
    currentCanAddress: integer('current_can_address').notNull(),
    addressValid: boolean('address_valid').notNull().default(false),
    enabled: boolean('enabled').notNull().default(true),
    requiredForOperation: boolean('required_for_operation').notNull().default(true),
    protocolMajor: integer('protocol_major'),
    protocolMinor: integer('protocol_minor'),
    firmwareMajor: integer('firmware_major'),
    firmwareMinor: integer('firmware_minor'),
    capabilityFlags: integer('capability_flags').notNull().default(0),
    sampleRateCode: integer('sample_rate_code'),
    calibrationValid: boolean('calibration_valid').notNull().default(false),
    baselineValid: boolean('baseline_valid').notNull().default(false),
    currentWeightValid: boolean('current_weight_valid').notNull().default(false),
    currentTotalWeightDg: integer('current_total_weight_dg'),
    storedBaselineWeightDg: integer('stored_baseline_weight_dg'),
    readyMask: integer('ready_mask').notNull().default(0),
    faultMask: integer('fault_mask').notNull().default(0),
    currentFaultCode: integer('current_fault_code').notNull().default(0),
    currentMode: integer('current_mode').notNull().default(0),
    currentSessionId: integer('current_session_id'),
    displayName: varchar('display_name', { length: 100 }),
    lastHeartbeatAt: timestamp('last_heartbeat_at', { withTimezone: true }),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_smart_shelf_fridge_uid').on(
      table.smartFridgeId,
      table.deviceUid
    ),
    index('idx_smart_shelf_fridge_address').on(
      table.smartFridgeId,
      table.currentCanAddress
    ),
    index('idx_smart_shelf_last_seen').on(table.lastSeenAt),
  ]
);

export const smartFridgeLayouts = pgTable(
  'smart_fridge_layouts',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    smartFridgeId: uuid('smart_fridge_id')
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: 'cascade' }),
    version: integer('version').notNull().default(1),
    name: varchar('name', { length: 100 }).notNull().default('Main layout'),
    isActive: boolean('is_active').notNull().default(true),
    createdBy: text('created_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_smart_fridge_layout_version').on(
      table.smartFridgeId,
      table.version
    ),
  ]
);

export const smartFridgeLayoutSlots = pgTable(
  'smart_fridge_layout_slots',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    layoutId: uuid('layout_id')
      .notNull()
      .references(() => smartFridgeLayouts.id, { onDelete: 'cascade' }),
    shelfId: uuid('shelf_id')
      .notNull()
      .references(() => smartShelfNodes.id, { onDelete: 'cascade' }),
    rowNumber: integer('row_number').notNull(),
    columnNumber: integer('column_number').notNull(),
    widthUnits: integer('width_units').notNull().default(1),
    heightUnits: integer('height_units').notNull().default(1),
    label: varchar('label', { length: 100 }),
  },
  (table) => [
    uniqueIndex('uq_smart_layout_position').on(
      table.layoutId,
      table.rowNumber,
      table.columnNumber
    ),
    uniqueIndex('uq_smart_layout_shelf').on(table.layoutId, table.shelfId),
  ]
);

export const smartShelfProductAssignments = pgTable(
  'smart_shelf_product_assignments',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    shelfId: uuid('shelf_id')
      .notNull()
      .references(() => smartShelfNodes.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    price: numeric('price', { precision: 10, scale: 2 }),
    currencyId: uuid('currency_id').references(() => currencies.id, {
      onDelete: 'restrict',
    }),
    unitWeightDgOverride: integer('unit_weight_dg_override'),
    toleranceDgOverride: integer('tolerance_dg_override'),
    targetQuantity: integer('target_quantity'),
    estimatedQuantity: integer('estimated_quantity'),
    activeFrom: timestamp('active_from', { withTimezone: true }).defaultNow(),
    activeUntil: timestamp('active_until', { withTimezone: true }),
    assignedBy: text('assigned_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [index('idx_smart_assignment_shelf').on(table.shelfId)]
);

export const smartFridgeServiceSessions = pgTable(
  'smart_fridge_service_sessions',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    smartFridgeId: uuid('smart_fridge_id')
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: 'cascade' }),
    protocolSessionId: integer('protocol_session_id'),
    serviceType: smartFridgeServiceType('service_type').notNull(),
    status: smartFridgeSessionStatus('status').notNull().default('open'),
    openedBy: text('opened_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    openedAt: timestamp('opened_at', { withTimezone: true }).defaultNow(),
    closedAt: timestamp('closed_at', { withTimezone: true }),
  }
);

export const smartFridgeCalibrationRuns = pgTable(
  'smart_fridge_calibration_runs',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    shelfId: uuid('shelf_id')
      .notNull()
      .references(() => smartShelfNodes.id, { onDelete: 'cascade' }),
    serviceSessionId: uuid('service_session_id').references(
      () => smartFridgeServiceSessions.id,
      { onDelete: 'set null' }
    ),
    calSessionId: integer('cal_session_id').notNull(),
    status: varchar('status', { length: 40 }).notNull().default('started'),
    knownWeightDg: integer('known_weight_dg'),
    algorithm: varchar('algorithm', { length: 30 }).notNull().default('qr'),
    rmsResidualDg: integer('rms_residual_dg'),
    maximumResidualDg: integer('maximum_residual_dg'),
    conditionNumber: numeric('condition_number', { precision: 18, scale: 6 }),
    validationPassed: boolean('validation_passed').notNull().default(false),
    saveToken: bigint('save_token', { mode: 'bigint' }),
    modelSchemaVersion: integer('model_schema_version'),
    modelGeneration: integer('model_generation'),
    crcValid: boolean('crc_valid'),
    startedBy: text('started_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    failureReason: text('failure_reason'),
  },
  (table) => [index('idx_smart_calibration_shelf').on(table.shelfId)]
);

export const smartFridgeCalibrationCaptures = pgTable(
  'smart_fridge_calibration_captures',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    calibrationRunId: uuid('calibration_run_id')
      .notNull()
      .references(() => smartFridgeCalibrationRuns.id, { onDelete: 'cascade' }),
    captureId: integer('capture_id').notNull(),
    position: varchar('position', { length: 40 }).notNull(),
    knownWeightDg: integer('known_weight_dg').notNull().default(0),
    rawCell1: integer('raw_cell_1').notNull(),
    rawCell2: integer('raw_cell_2').notNull(),
    rawCell3: integer('raw_cell_3').notNull(),
    rawCell4: integer('raw_cell_4').notNull(),
    sampleCount: integer('sample_count').notNull(),
    stable: boolean('stable').notNull(),
    capturedAt: timestamp('captured_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_smart_calibration_capture').on(
      table.calibrationRunId,
      table.captureId
    ),
  ]
);

export const smartFridgeCalibrationModelCells = pgTable(
  'smart_fridge_calibration_model_cells',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    calibrationRunId: uuid('calibration_run_id')
      .notNull()
      .references(() => smartFridgeCalibrationRuns.id, { onDelete: 'cascade' }),
    cellNumber: integer('cell_number').notNull(),
    zeroRaw: integer('zero_raw').notNull(),
    gainQ824: integer('gain_q8_24').notNull(),
  },
  (table) => [
    uniqueIndex('uq_smart_calibration_model_cell').on(
      table.calibrationRunId,
      table.cellNumber
    ),
  ]
);

export const smartFridgeShoppingSessions = pgTable(
  'smart_fridge_shopping_sessions',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    smartFridgeId: uuid('smart_fridge_id')
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: 'cascade' }),
    protocolSessionId: integer('protocol_session_id').notNull(),
    status: smartFridgeShoppingStatus('status').notNull(),
    authorizationReference: varchar('authorization_reference', { length: 200 }),
    paymentReference: varchar('payment_reference', { length: 200 }),
    totalAmount: numeric('total_amount', { precision: 12, scale: 2 }),
    currencyId: uuid('currency_id').references(() => currencies.id, {
      onDelete: 'restrict',
    }),
    doorOpenedAt: timestamp('door_opened_at', { withTimezone: true }),
    doorClosedAt: timestamp('door_closed_at', { withTimezone: true }),
    finalVerificationAt: timestamp('final_verification_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    abortedAt: timestamp('aborted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_smart_shopping_protocol_session').on(
      table.smartFridgeId,
      table.protocolSessionId
    ),
  ]
);

export const smartFridgeShelfStates = pgTable(
  'smart_fridge_shelf_states',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    shoppingSessionId: uuid('shopping_session_id')
      .notNull()
      .references(() => smartFridgeShoppingSessions.id, { onDelete: 'cascade' }),
    shelfId: uuid('shelf_id')
      .notNull()
      .references(() => smartShelfNodes.id, { onDelete: 'cascade' }),
    latestEventSequence: integer('latest_event_sequence'),
    latestFinalSequence: integer('latest_final_sequence'),
    deltaWeightDg: integer('delta_weight_dg').notNull().default(0),
    eventType: integer('event_type').notNull().default(0),
    quality: integer('quality').notNull().default(3),
    mode: integer('mode').notNull().default(0),
    stable: boolean('stable').notNull().default(false),
    protocolFlags: integer('protocol_flags').notNull().default(0),
    assignedProductId: uuid('assigned_product_id').references(() => products.id, {
      onDelete: 'set null',
    }),
    matchedProductId: uuid('matched_product_id').references(() => products.id, {
      onDelete: 'set null',
    }),
    matchedQuantity: integer('matched_quantity'),
    matchResult: varchar('match_result', { length: 40 }),
    finalStateReceived: boolean('final_state_received').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_smart_session_shelf_state').on(
      table.shoppingSessionId,
      table.shelfId
    ),
  ]
);

export const smartFridgeProtocolEvents = pgTable(
  'smart_fridge_protocol_events',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    shoppingSessionId: uuid('shopping_session_id').references(
      () => smartFridgeShoppingSessions.id,
      { onDelete: 'cascade' }
    ),
    shelfId: uuid('shelf_id')
      .notNull()
      .references(() => smartShelfNodes.id, { onDelete: 'cascade' }),
    protocolSessionId: integer('protocol_session_id').notNull(),
    messageClass: integer('message_class').notNull(),
    sequenceNumber: integer('sequence_number').notNull(),
    eventType: integer('event_type'),
    quality: integer('quality'),
    deltaWeightDg: integer('delta_weight_dg'),
    rawMeta: integer('raw_meta'),
    rawFlags: integer('raw_flags'),
    acknowledgementResult: integer('acknowledgement_result'),
    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_smart_protocol_event_dedupe').on(
      table.shelfId,
      table.protocolSessionId,
      table.messageClass,
      table.sequenceNumber
    ),
  ]
);

export const smartFridgeBaselineCommits = pgTable(
  'smart_fridge_baseline_commits',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    shoppingSessionId: uuid('shopping_session_id').references(
      () => smartFridgeShoppingSessions.id,
      { onDelete: 'cascade' }
    ),
    shelfId: uuid('shelf_id')
      .notNull()
      .references(() => smartShelfNodes.id, { onDelete: 'cascade' }),
    protocolSessionId: integer('protocol_session_id').notNull(),
    finalSequence: integer('final_sequence').notNull(),
    commitToken: bigint('commit_token', { mode: 'bigint' }).notNull(),
    action: integer('action').notNull(),
    result: integer('result'),
    previousBaselineDg: integer('previous_baseline_dg'),
    committedBaselineDg: integer('committed_baseline_dg'),
    requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow(),
    acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('uq_smart_commit_token').on(table.shelfId, table.commitToken)]
);

export const smartFridgeSyncOutbox = pgTable(
  'smart_fridge_sync_outbox',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    smartFridgeId: uuid('smart_fridge_id')
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: 'cascade' }),
    entityType: varchar('entity_type', { length: 80 }).notNull(),
    entityId: varchar('entity_id', { length: 100 }).notNull(),
    operation: varchar('operation', { length: 20 }).notNull(),
    payload: jsonb('payload').notNull(),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    syncedAt: timestamp('synced_at', { withTimezone: true }),
  },
  (table) => [index('idx_smart_sync_pending').on(table.smartFridgeId, table.syncedAt)]
);

export const smartFridgeEdgeDevices = pgTable(
  'smart_fridge_edge_devices',
  {
    id: uuid('id').primaryKey().$defaultFn(() => uuidv7()),
    smartFridgeId: uuid('smart_fridge_id')
      .notNull()
      .references(() => smartFridgeProfiles.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    deviceKey: varchar('device_key', { length: 120 }).notNull(),
    displayName: varchar('display_name', { length: 120 }),
    enabled: boolean('enabled').notNull().default(true),
    lastCursor: bigint('last_cursor', { mode: 'bigint' }).notNull().default(0),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex('uq_smart_edge_device_key').on(table.deviceKey),
    index('idx_smart_edge_fridge').on(table.smartFridgeId),
  ]
);
