/**
 * ⚠️ SERVER-ONLY FILE
 */

import { db } from '@/server/db';
import {
  machines,
  machineTypes,
  machineModes,
  compartments,
} from '@/server/db/schema';
import { user, organization, member } from '@/server/db/schema/auth';
import { eq, and } from 'drizzle-orm';
import type { User } from '#/server/schemas/auth';
import z from 'zod';
import { MachineType, UserRole, MemberRole } from '#/shared/enums';

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

export type MachineTypeDto = {
  id: string;
  machineTypeName: string;
};

export type MachineModeDto = {
  id: string;
  machineModeName: string | null;
};

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

  let results: MachineDto[];

  if (currentUser.role === UserRole.Admin) {
    results = await baseQuery;
  } else {
    if (!activeOrg) {
      return [];
    }
    results = await baseQuery.where(eq(machines.organizationId, activeOrg.id));
  }

  return results;
}

export async function getMachineTypes(): Promise<MachineTypeDto[]> {
  const results = await db.select().from(machineTypes);
  return results;
}

export async function getMachineModes(): Promise<MachineModeDto[]> {
  const results = await db.select().from(machineModes);
  return results;
}

export async function createMachine(
  data: CreateMachine,
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<{ id: string }> {
  if (!activeOrg) {
    throw new Error('No active organization');
  }

  if (currentUser.role !== UserRole.Admin) {
    // Check if user is owner of the org
    const [mem] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, activeOrg.id),
          eq(member.userId, currentUser.id)
        )
      )
      .limit(1);
    if (!mem || mem.role !== MemberRole.Owner) {
      throw new Error('Unauthorized');
    }
  }

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

  if (machineType.machineTypeName === MachineType.Lockbox) {
    if (!data.compartmentCount || data.compartmentCount <= 0) {
      throw new Error('Compartment count is required for lockbox machines');
    }
  }

  const [createdMachine] = await db
    .insert(machines)
    .values({
      machineName: data.machineName,
      serialNumber: data.serialNumber,
      productionYear: data.productionYear,
      machineModeId: data.machineModeId,
      machineTypeId: data.machineTypeId,
      compartmentCount: data.compartmentCount || 0,
      organizationId: activeOrg.id,
      createdBy: currentUser.id,
    })
    .returning();

  if (
    machineType.machineTypeName === MachineType.Lockbox &&
    data.compartmentCount > 0
  ) {
    const compartmentsToInsert = Array.from(
      { length: data.compartmentCount },
      (_, index) => ({
        machineId: createdMachine.id,
        compartmentNumber: index + 1,
        organizationId: activeOrg.id,
        createdBy: currentUser.id,
      })
    );

    await db.insert(compartments).values(compartmentsToInsert);
  }

  return { id: createdMachine.id };
}

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
    .select({
      id: user.id,
    })
    .from(user)
    .where(eq(user.id, data.userId))
    .limit(1);

  if (!targetUser) {
    throw new Error('User not found.');
  }

  await db
    .update(machines)
    .set({
      createdBy: targetUser.id,
      organizationId: data.organizationId,
    })
    .where(eq(machines.id, existingMachine.id));

  await db
    .update(compartments)
    .set({ managedBy: targetUser.id })
    .where(eq(compartments.machineId, existingMachine.id));

  return { machineName: existingMachine.machineName };
}

export const updateMachineModeApiSchema = z.object({
  machineId: z.uuid('Machine ID is required'),
  machineModeId: z.uuid('Machine mode is required'),
});

type UpdateMachineMode = z.infer<typeof updateMachineModeApiSchema>;

export async function updateMachineMode(
  data: UpdateMachineMode,
  _currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<{ machineName: string }> {
  if (!activeOrg) {
    throw new Error('No active organization');
  }

  const [existingMachine] = await db
    .select({
      id: machines.id,
      machineName: machines.machineName,
    })
    .from(machines)
    .where(eq(machines.id, data.machineId))
    .limit(1);

  if (!existingMachine) {
    throw new Error('Machine not found.');
  }

  await db
    .update(machines)
    .set({ machineModeId: data.machineModeId })
    .where(eq(machines.id, data.machineId));

  return { machineName: existingMachine.machineName };
}

export async function getMachineBySerialNumber(
  serialNumber: string
): Promise<{ id: string; machineName: string } | null> {
  const [machine] = await db
    .select({
      id: machines.id,
      machineName: machines.machineName,
    })
    .from(machines)
    .where(eq(machines.serialNumber, serialNumber))
    .limit(1);

  if (machine) return { id: machine.id, machineName: machine.machineName };
  else return null;
}
