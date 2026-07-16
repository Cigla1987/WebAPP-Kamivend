import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '#/server/db';
import {
  machineTypes,
  machines,
  smartFridgeDeviceCredentials,
  smartFridgePairingCodes,
  smartFridgeProfiles,
} from '@vending/db';
import { organization } from '@vending/auth';
import { MachineType } from '@vending/domain';
import { serverEnv } from '#/config/env';

const secret = () => serverEnv().SMART_FRIDGE_EDGE_AUTH_SECRET;
export const hashEdgeSecret = (value: string) =>
  createHmac('sha256', secret()).update(value).digest('hex');
export const createEdgeSecret = () =>
  `sf_${randomBytes(32).toString('base64url')}`;
export const hashPairingCode = (value: string) =>
  createHmac('sha256', secret())
    .update(value.replace(/[-\s]/g, '').toUpperCase())
    .digest('hex');
export const verifyServicePin = (
  pin: string,
  verifier: string,
  salt: string
) => {
  const expected = Buffer.from(verifier, 'hex');
  const actual = scryptSync(pin, salt, expected.length);
  return (
    expected.length > 0 &&
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
};

export async function requireEdgeContext(request: Request) {
  const header = request.headers.get('authorization') || '';
  const credential = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!credential) throw new Response('Authorization failed.', { status: 401 });
  const credentialHash = hashEdgeSecret(credential);
  const [context] = await db
    .select({
      edgeDeviceId: smartFridgeDeviceCredentials.id,
      smartFridgeId: smartFridgeProfiles.id,
      machineId: machines.id,
      organizationId: machines.organizationId,
      machineEnabled: machines.enabled,
      deviceEnabled: smartFridgeDeviceCredentials.enabled,
      deviceRevokedAt: smartFridgeDeviceCredentials.revokedAt,
      machineTypeName: machineTypes.machineTypeName,
    })
    .from(smartFridgeDeviceCredentials)
    .innerJoin(
      smartFridgeProfiles,
      eq(smartFridgeProfiles.id, smartFridgeDeviceCredentials.smartFridgeId)
    )
    .innerJoin(machines, eq(machines.id, smartFridgeProfiles.machineId))
    .innerJoin(machineTypes, eq(machineTypes.id, machines.machineTypeId))
    .where(eq(smartFridgeDeviceCredentials.credentialHash, credentialHash))
    .limit(1);
  if (
    !context ||
    !context.deviceEnabled ||
    context.deviceRevokedAt ||
    !context.machineEnabled ||
    !context.organizationId ||
    context.machineTypeName !== MachineType.Smartfridge
  )
    throw new Response('Edge device is disabled.', { status: 401 });
  return { ...context, organizationId: context.organizationId };
}

export async function pairEdgeDevice(input: {
  pairingCode: string;
  deviceName: string;
  appVersion: string;
}) {
  const codeHash = hashPairingCode(input.pairingCode);
  const now = new Date();
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        codeId: smartFridgePairingCodes.id,
        smartFridgeId: smartFridgeProfiles.id,
        machineId: machines.id,
        organizationId: machines.organizationId,
        machineName: machines.machineName,
        organizationName: organization.name,
        machineTypeName: machineTypes.machineTypeName,
        machineEnabled: machines.enabled,
      })
      .from(smartFridgePairingCodes)
      .innerJoin(
        smartFridgeProfiles,
        eq(smartFridgeProfiles.id, smartFridgePairingCodes.smartFridgeId)
      )
      .innerJoin(machines, eq(machines.id, smartFridgeProfiles.machineId))
      .innerJoin(machineTypes, eq(machineTypes.id, machines.machineTypeId))
      .innerJoin(organization, eq(organization.id, machines.organizationId))
      .where(
        and(
          eq(smartFridgePairingCodes.codeHash, codeHash),
          isNull(smartFridgePairingCodes.usedAt),
          isNull(smartFridgePairingCodes.revokedAt),
          gt(smartFridgePairingCodes.expiresAt, now)
        )
      )
      .limit(1);
    if (
      !row ||
      !row.organizationId ||
      !row.machineEnabled ||
      row.machineTypeName !== MachineType.Smartfridge
    )
      throw new Error('PAIRING_CODE_INVALID');
    const [existing] = await tx
      .select({ id: smartFridgeDeviceCredentials.id })
      .from(smartFridgeDeviceCredentials)
      .where(
        and(
          eq(smartFridgeDeviceCredentials.smartFridgeId, row.smartFridgeId),
          eq(smartFridgeDeviceCredentials.enabled, true),
          isNull(smartFridgeDeviceCredentials.revokedAt)
        )
      )
      .limit(1);
    if (existing) throw new Error('EDGE_DEVICE_ALREADY_PAIRED');
    const deviceCredential = createEdgeSecret();
    const [device] = await tx
      .insert(smartFridgeDeviceCredentials)
      .values({
        smartFridgeId: row.smartFridgeId,
        deviceName: input.deviceName,
        credentialHash: hashEdgeSecret(deviceCredential),
        credentialPrefix: deviceCredential.slice(0, 10),
        appVersion: input.appVersion,
      })
      .returning({ id: smartFridgeDeviceCredentials.id });
    const [used] = await tx
      .update(smartFridgePairingCodes)
      .set({ usedAt: now })
      .where(
        and(
          eq(smartFridgePairingCodes.id, row.codeId),
          isNull(smartFridgePairingCodes.usedAt)
        )
      )
      .returning({ id: smartFridgePairingCodes.id });
    if (!used) throw new Error('PAIRING_CODE_INVALID');
    return {
      machineId: row.machineId,
      smartFridgeId: row.smartFridgeId,
      edgeDeviceId: device.id,
      organizationId: row.organizationId,
      machineName: row.machineName,
      organizationName: row.organizationName,
      deviceCredential,
      expiresAt: null,
    };
  });
}
