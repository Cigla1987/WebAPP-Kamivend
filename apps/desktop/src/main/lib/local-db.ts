import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';

let database: Database.Database | null = null;

function migrate(db: Database.Database) {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS local_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bound_machine (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      cloud_machine_id TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      machine_name TEXT NOT NULL,
      organization_id TEXT,
      machine_type TEXT NOT NULL CHECK (machine_type = 'smartfridge'),
      last_validated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS shelf_nodes (
      id TEXT PRIMARY KEY,
      machine_id TEXT NOT NULL,
      address INTEGER NOT NULL CHECK (address BETWEEN 1 AND 31),
      device_uid TEXT,
      row_index INTEGER,
      column_index INTEGER,
      display_order INTEGER,
      product_id TEXT,
      calibration_valid INTEGER NOT NULL DEFAULT 0,
      baseline_valid INTEGER NOT NULL DEFAULT 0,
      refill_capable INTEGER NOT NULL DEFAULT 0,
      last_fault INTEGER,
      last_heartbeat_at TEXT,
      UNIQUE(machine_id, address)
    );

    CREATE TABLE IF NOT EXISTS local_product_hardware_config (
      product_id TEXT PRIMARY KEY,
      nominal_unit_weight_g REAL NOT NULL,
      tolerance_g REAL NOT NULL,
      maximum_count INTEGER,
      refill_target INTEGER,
      low_stock_threshold INTEGER,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hardware_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      direction TEXT NOT NULL,
      can_id INTEGER NOT NULL,
      payload_hex TEXT NOT NULL,
      decoded_type TEXT,
      shelf_address INTEGER,
      session_id INTEGER,
      request_id INTEGER,
      result_code INTEGER
    );

    CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      next_attempt_at TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_shelf_nodes_machine
      ON shelf_nodes(machine_id, display_order);
    CREATE INDEX IF NOT EXISTS idx_hardware_events_created
      ON hardware_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_sync_outbox_next_attempt
      ON sync_outbox(next_attempt_at);
  `);
}

export function getLocalDatabase() {
  if (database) return database;

  const filePath = path.join(app.getPath('userData'), 'smartfridge.sqlite');
  database = new Database(filePath);
  migrate(database);
  return database;
}

export function closeLocalDatabase() {
  database?.close();
  database = null;
}

export function getBoundMachine() {
  return getLocalDatabase()
    .prepare('SELECT * FROM bound_machine WHERE id = 1')
    .get();
}

export function bindSmartfridgeMachine(input: {
  cloudMachineId: string;
  serialNumber: string;
  machineName: string;
  organizationId?: string | null;
  machineType: string;
}) {
  if (input.machineType !== 'smartfridge') {
    throw new Error('Only smartfridge machines can be bound to this desktop app.');
  }

  getLocalDatabase()
    .prepare(`
      INSERT INTO bound_machine (
        id, cloud_machine_id, serial_number, machine_name,
        organization_id, machine_type, last_validated_at
      ) VALUES (1, ?, ?, ?, ?, 'smartfridge', CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        cloud_machine_id = excluded.cloud_machine_id,
        serial_number = excluded.serial_number,
        machine_name = excluded.machine_name,
        organization_id = excluded.organization_id,
        machine_type = excluded.machine_type,
        last_validated_at = CURRENT_TIMESTAMP
    `)
    .run(
      input.cloudMachineId,
      input.serialNumber,
      input.machineName,
      input.organizationId ?? null,
    );

  return getBoundMachine();
}
