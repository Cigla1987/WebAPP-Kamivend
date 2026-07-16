import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../../../../');
describe('SmartFridge integration security', () => {
  it('migration is additive for shared Lockbox tables', () => {
    const sql = fs.readFileSync(
      path.join(root, 'apps/web/migrations/0002_brown_victor_mancha.sql'),
      'utf8'
    );
    expect(sql).not.toMatch(/DROP TABLE|TRUNCATE|DELETE FROM|RENAME TABLE/i);
    expect(sql).toContain('smart_fridge_device_credentials');
    expect(sql).toContain('organization_service_credentials');
  });
  it('edge requests do not accept organization identity', () => {
    for (const file of ['pair.ts', 'users.ts', 'heartbeat.ts']) {
      const source = fs.readFileSync(
        path.join(root, 'apps/web/src/routes/api/edge/v1', file),
        'utf8'
      );
      expect(source).not.toContain('organizationId:z.');
    }
  });
  it('Lockbox writes require compartment machine access', () => {
    const source = fs.readFileSync(
      path.join(
        root,
        'apps/web/src/routes/_auth/machines/$machineId/compartments/-compartments.server.ts'
      ),
      'utf8'
    );
    expect(source).toContain('requireCompartmentAccess');
  });
});
