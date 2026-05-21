/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import {
  machines,
  machineTypes,
  machineModes,
  compartments,
} from '@/server/db/schema';
import { user } from '@/server/db/schema/auth';
import { eq } from 'drizzle-orm';
import type { User } from '#/server/schemas/auth';
import z from 'zod';

export type MachineDto = {
  id: number;
  machineName: string;
  serialNumber: string;
  productionYear: number;
  compartmentCount: number;
  machineDateCreated: Date | null;
  machineModeName: string | null;
  machineTypeName: string | null;
  ownerName: string | null;
};

export const createMachineApiSchema = z.object({
  machineName: z.string().min(1, 'Machine name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  productionYear: z
    .int('Production year is required')
    .min(1900)
    .max(new Date().getFullYear() + 1),
  machineModeId: z.int('Machine mode is required').positive(),
  machineTypeId: z.int('Machine type is required').positive(),
  compartmentCount: z.int('Compartment count is required').min(1),
});

type CreateMachine = z.infer<typeof createMachineApiSchema>;

export const assignMachineApiSchema = z.object({
  serialNumber: z.string().min(1, { error: 'Serial number is required' }),
  // ownerId: z.string().min(1, { error: 'Owner is required' }),
  ownerId: z.string(),
});

type AssignMachine = z.infer<typeof assignMachineApiSchema>;

export type MachineTypeDto = {
  id: number;
  machineTypeName: string;
};

export type MachineModeDto = {
  id: number;
  machineModeName: string | null;
};

export async function getMachines(
  currentUser: Pick<User, 'id' | 'role'>
): Promise<MachineDto[]> {
  const userId = currentUser.id;
  const role = currentUser.role;

  // Base query with inner joins (machines must have mode and type)
  const baseQuery = db
    .select({
      id: machines.id,
      machineName: machines.machineName,
      serialNumber: machines.serialNumber,
      productionYear: machines.productionYear,
      compartmentCount: machines.compartmentCount,
      machineDateCreated: machines.machineDateCreated,
      machineModeName: machineModes.machineModeName,
      machineTypeName: machineTypes.machineTypeName,
      ownerName: user.name,
    })
    .from(machines)
    .innerJoin(machineModes, eq(machines.machineModeId, machineModes.id))
    .innerJoin(machineTypes, eq(machines.machineTypeId, machineTypes.id))
    .leftJoin(user, eq(machines.ownerId, user.id));

  let results: MachineDto[];

  if (role === 'superadmin') {
    // Superadmin sees all machines
    results = await baseQuery;
  } else if (role === 'owner') {
    // Owner sees only their machines
    results = await baseQuery.where(eq(machines.ownerId, userId));
  } else if (role === 'member') {
    // Member sees machines where they manage compartments
    results = await baseQuery
      .innerJoin(compartments, eq(machines.id, compartments.machineId))
      .where(eq(compartments.managedBy, userId))
      .groupBy(
        machines.id,
        machines.machineName,
        machines.serialNumber,
        machines.productionYear,
        machineModes.machineModeName,
        machineTypes.machineTypeName,
        machines.compartmentCount,
        machines.machineDateCreated,
        user.name
      );
  } else {
    throw new Error('Unauthorized');
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
  data: CreateMachine
): Promise<{ id: number }> {
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

  // Validate compartment count for lockbox machines
  if (machineType.machineTypeName === 'lockbox') {
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
    })
    .returning();

  // Create compartments for lockbox machines
  if (machineType.machineTypeName === 'lockbox' && data.compartmentCount > 0) {
    const compartmentsToInsert = Array.from(
      { length: data.compartmentCount },
      (_, index) => ({
        machineId: createdMachine.id,
        compartmentNumber: index + 1,
      })
    );

    await db.insert(compartments).values(compartmentsToInsert);
  }

  return { id: createdMachine.id };
}

export async function updateMachineOwner(
  data: AssignMachine
): Promise<{ machineName: string }> {
  const machine = await getMachineBySerialNumber(data.serialNumber);

  const [owner] = await db
    .select({
      id: user.id,
    })
    .from(user)
    .where(eq(user.id, data.ownerId))
    .limit(1);

  if (!owner) {
    throw new Error('Owner not found.');
  }

  await db
    .update(machines)
    .set({ ownerId: owner.id })
    .where(eq(machines.id, machine.id));

  await db
    .update(compartments)
    .set({ managedBy: owner.id })
    .where(eq(compartments.machineId, machine.id));

  return { machineName: machine.machineName };
}

export async function getMachineBySerialNumber(
  serialNumber: string
): Promise<{ id: number; machineName: string }> {
  const [machine] = await db
    .select({
      id: machines.id,
      machineName: machines.machineName,
    })
    .from(machines)
    .where(eq(machines.serialNumber, serialNumber))
    .limit(1);

  if (!machine) {
    throw new Error('Machine not found');
  }

  return { id: machine.id, machineName: machine.machineName };
}
