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

export type CreateMachineDto = {
  machineName: string;
  serialNumber: string;
  productionYear: number;
  machineModeId: number;
  machineTypeId: number;
  compartmentCount: number;
};

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
  data: CreateMachineDto
): Promise<{ id: number }> {
  // Check for duplicate serial number
  const existingMachine = await db
    .select({ id: machines.id })
    .from(machines)
    .where(eq(machines.serialNumber, data.serialNumber))
    .limit(1);

  if (existingMachine.length > 0) {
    throw new Error('Machine with this serial number already exists');
  }

  // Get machine type name for validation
  const [machineType] = await db
    .select({ machineTypeName: machineTypes.machineTypeName })
    .from(machineTypes)
    .where(eq(machineTypes.id, data.machineTypeId))
    .limit(1);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!machineType) {
    throw new Error('Invalid machine type');
  }

  // Validate compartment count for lockbox machines
  if (machineType.machineTypeName === 'lockbox') {
    if (!data.compartmentCount || data.compartmentCount <= 0) {
      throw new Error('Compartment count is required for lockbox machines');
    }
  }

  // Insert the machine
  const [machine] = await db
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
        machineId: machine.id,
        compartmentNumber: index + 1,
      })
    );

    await db.insert(compartments).values(compartmentsToInsert);
  }

  return { id: machine.id };
}
