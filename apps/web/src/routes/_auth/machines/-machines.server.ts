/**
 * ⚠️ SERVER-ONLY FILE
 */

import { createHash, randomBytes } from 'node:crypto';
import { db } from '#/server/db';
import {
  machines,
  machineTypes,
  machineModes,
  compartments,
  machineClaimCodes,
  smartFridgeProfiles,
} from '@vending/db';
import { user, organization } from '@vending/auth';
import { and, eq, gt, isNull } from 'drizzle-orm';
import type { User } from '@vending/auth';
import z from 'zod';
import { MachineType, UserRole } from '@vending/domain';

export type MachineDto = {
  id: string;
  machineName: string;
  serialNumber: string;
  productionYear: number;
  compartmentCount: number;
  machineDateCreated: Date | null;
  machineModeId: string | null;
  machineModeName: string | null;
  machineTypeName: string | null;
  organizationName: string | null;
};

export const createMachineApiSchema = z.object({
  machineName: z.string().min(1, 'Machine name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  productionYear: z
    .int('Production year is required')
    .min(1900)
    .max(new Date().getFullYear() + 1),
  machineModeId: z.uuid('Machine mode is required'),
  machineTypeId: z.uuid('Machine type is required'),
  compartmentCount: z.int('Compartment count is required').min(0),
});

type CreateMachine = z.infer<typeof createMachineApiSchema>;

export const assignMachineApiSchema = z.object({
  serialNumber: z.string().min(1, { error: 'Serial number is required' }),
  userId: z.string(),
  organizationId: z.string().min(1, { error: 'Organization is required' }),
});

type AssignMachine = z.infer<typeof assignMachineApiSchema>;

export const claimMachineApiSchema = z.object({
  serialNumber: z.string().min(1, 'Serial number is required').trim(),
  activationCode: z
    .string()
    .min(12, 'Activation code is invalid')
    .max(64, 'Activation code is invalid')
    .trim(),
});

type ClaimMachine = z.infer<typeof claimMachineApiSchema>;

export type MachineTypeDto = {
  id: string;
  machineTypeName: string;
};

export type MachineModeDto = {
  id: string;
  machineModeName: string | null;
};

function normalizeActivationCode(value: string): string {
  return value.replace(/[-\s]/g, '').toUpperCase();
}

function hashActivationCode(value: string): string {
  return createHash('sha256')
    .update(normalizeActivationCode(value), 'utf8')
    .digest('hex');
}

function createActivationCode(): string {
  const raw = randomBytes(12).toString('hex').toUpperCase();
  return raw.match(/.{1,4}/g)?.join('-') ?? raw;
}

export async function getMachines(
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<MachineDto[]> {
  const baseQuery = db
    .select({
      id: machines.id,
      machineName: machines.machineName,
      serialNumber: machines.serialNumber,
      productionYear: machines.productionYear,
      compartmentCount: machines.compartmentCount,
      machineDateCreated: machines.machineDateCreated,
      machineModeId: machineModes.id,
      machineModeName: machineModes.machineModeName,
      machineTypeName: machineTypes.machineTypeName,
      organizationName: organization.name,
    })
    .from(machines)
    .innerJoin(machineModes, eq(machines.machineModeId, machineModes.id))
    .innerJoin(machineTypes, eq(machines.machineTypeId, machineTypes.id))
    .leftJoin(organization, eq(machines.organizationId, organization.id));

  if (currentUser.role === UserRole.Admin) {
    return baseQuery;
  }

  if (!activeOrg) {
    return [];
  }

  return baseQuery.where(eq(machines.organizationId, activeOrg.id));
}

export async function getMachineTypes(): Promise<MachineTypeDto[]> {
  return db.select().from(machineTypes);
}

export async function getMachineModes(): Promise<MachineModeDto[]> {
  return db.select().from(machineModes);
}

export async function createMachine(
  data: CreateMachine,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<{ id: string; activationCode: string }> {
  const existingMachine = await getMachineBySerialNumber(data.serialNumber);
  if (existingMachine) {
    throw new Error('Machine with this serial number already exists.');
  }

  const [machineType] = await db
    .select({ machineTypeName: machineTypes.machineTypeName })
    .from(machineTypes)
    .where(eq(machineTypes.id, data.machineTypeId))
    .limit(1);

  if (!machineType) {
    throw new Error('Invalid machine type');
  }

  if (
    machineType.machineTypeName === MachineType.Lockbox &&
    (!data.compartmentCount || data.compartmentCount <= 0)
  ) {
    throw new Error('Compartment count is required for lockbox machines');
  }

  const activationCode = createActivationCode();
  const codeHash = hashActivationCode(activationCode);
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const createdMachine = await db.transaction(async (tx) => {
    const [machine] = await tx
      .insert(machines)
      .values({
        machineName: data.machineName,
        serialNumber: data.serialNumber,
        productionYear: data.productionYear,
        machineModeId: data.machineModeId,
        machineTypeId: data.machineTypeId,
        compartmentCount:
          machineType.machineTypeName === MachineType.Lockbox
            ? data.compartmentCount
            : 0,
        createdBy: currentUser.id,
      })
      .returning();

    if (machineType.machineTypeName === MachineType.Lockbox) {
      await tx.insert(compartments).values(
        Array.from({ length: data.compartmentCount }, (_, index) => ({
          machineId: machine.id,
          compartmentNumber: index + 1,
          managedBy: null,
        }))
      );
    }

    if (machineType.machineTypeName === MachineType.Smartfridge) {
      await tx.insert(smartFridgeProfiles).values({
        machineId: machine.id,
        fridgeCode: data.serialNumber,
        expectedShelfCount: 0,
        canBitrate: 250000,
        protocolMajor: 1,
        protocolMinor: 3,
        setupCompleted: false,
        customerOperationEnabled: false,
      });
    }

    await tx.insert(machineClaimCodes).values({
      machineId: machine.id,
      codeHash,
      expiresAt,
      createdBy: currentUser.id,
    });

    return machine;
  });

  return { id: createdMachine.id, activationCode };
}

/** Platform-admin assignment remains available for support and legacy sales. */
export async function updateMachineOwner(
  data: AssignMachine,
  _currentUser: Pick<User, 'id' | 'role'>,
  _activeOrg: typeof organization.$inferSelect | null
): Promise<{ machineName: string }> {
  const existingMachine = await getMachineBySerialNumber(data.serialNumber);

  if (!existingMachine) {
    throw new Error('Machine not found.');
  }

  const [targetUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, data.userId))
    .limit(1);

  if (!targetUser) {
    throw new Error('User not found.');
  }

  await db.transaction(async (tx) => {
    const [assigned] = await tx
      .update(machines)
      .set({ organizationId: data.organizationId })
      .where(
        and(
          eq(machines.id, existingMachine.id),
          isNull(machines.organizationId)
        )
      )
      .returning({ id: machines.id });

    if (!assigned) {
      throw new Error('Machine is already assigned to an organization.');
    }

    await tx
      .update(compartments)
      .set({ managedBy: targetUser.id })
      .where(eq(compartments.machineId, existingMachine.id));

    await tx
      .update(machineClaimCodes)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(machineClaimCodes.machineId, existingMachine.id),
          isNull(machineClaimCodes.usedAt),
          isNull(machineClaimCodes.revokedAt)
        )
      );
  });

  return { machineName: existingMachine.machineName };
}

export async function claimMachine(
  data: ClaimMachine,
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<{ machineId: string; machineName: string }> {
  if (!activeOrg) {
    throw new Error('Select your organization before claiming a machine.');
  }

  const codeHash = hashActivationCode(data.activationCode);
  const now = new Date();

  return db.transaction(async (tx) => {
    const [claim] = await tx
      .select({
        claimId: machineClaimCodes.id,
        machineId: machines.id,
        machineName: machines.machineName,
        organizationId: machines.organizationId,
      })
      .from(machineClaimCodes)
      .innerJoin(machines, eq(machines.id, machineClaimCodes.machineId))
      .where(
        and(
          eq(machines.serialNumber, data.serialNumber),
          eq(machineClaimCodes.codeHash, codeHash),
          isNull(machineClaimCodes.usedAt),
          isNull(machineClaimCodes.revokedAt),
          gt(machineClaimCodes.expiresAt, now)
        )
      )
      .limit(1);

    if (!claim) {
      throw new Error('Serial number or activation code is invalid or expired.');
    }

    if (claim.organizationId) {
      throw new Error('Machine is already assigned to an organization.');
    }

    const [assigned] = await tx
      .update(machines)
      .set({ organizationId: activeOrg.id })
      .where(
        and(eq(machines.id, claim.machineId), isNull(machines.organizationId))
      )
      .returning({ id: machines.id });

    if (!assigned) {
      throw new Error('Machine was claimed by another organization.');
    }

    await tx
      .update(machineClaimCodes)
      .set({
        usedAt: now,
        usedBy: currentUser.id,
        usedOrganizationId: activeOrg.id,
      })
      .where(eq(machineClaimCodes.id, claim.claimId));

    return {
      machineId: claim.machineId,
      machineName: claim.machineName,
    };
  });
}

export const updateMachineModeApiSchema = z.object({
  machineId: z.uuid('Machine ID is required'),
  machineModeId: z.uuid('Machine mode is required'),
});

type UpdateMachineMode = z.infer<typeof updateMachineModeApiSchema>;

export async function updateMachineMode(
  data: UpdateMachineMode,
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<{ machineName: string }> {
  const conditions = [eq(machines.id, data.machineId)];

  if (currentUser.role !== UserRole.Admin) {
    if (!activeOrg) {
      throw new Error('Unauthorized.');
    }
    conditions.push(eq(machines.organizationId, activeOrg.id));
  }

  const [existingMachine] = await db
    .select({ id: machines.id, machineName: machines.machineName })
    .from(machines)
    .where(and(...conditions))
    .limit(1);

  if (!existingMachine) {
    throw new Error('Machine not found or access denied.');
  }

  await db
    .update(machines)
    .set({ machineModeId: data.machineModeId })
    .where(eq(machines.id, existingMachine.id));

  return { machineName: existingMachine.machineName };
}

export async function getMachineBySerialNumber(
  serialNumber: string
): Promise<{ id: string; machineName: string } | null> {
  const [machine] = await db
    .select({ id: machines.id, machineName: machines.machineName })
    .from(machines)
    .where(eq(machines.serialNumber, serialNumber))
    .limit(1);

  return machine ?? null;
}
