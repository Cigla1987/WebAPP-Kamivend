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

/**
 * Machine type with joined relations
 * Matches the actual query result from fetchMachines()
 */
export type MachineDto = {
  id: number;
  machineName: string;
  serialNumber: string;
  productionYear: number;
  compartmentCount: number;
  machineDateCreated: Date | null;
  latitude: string | null;
  longitude: string | null;
  machineModeId: number | null;
  machineTypeId: number;
  ownerId: string | null;
  machineTypeName: string | null;
  machineModeName: string | null;
  ownerName: string | null;
};

/**
 * Machine type definition
 */
export type MachineTypeDto = {
  id: number;
  machineTypeName: string;
};

/**
 * Machine mode definition
 */
export type MachineModeDto = {
  id: number;
  machineModeName: string | null;
};
/**
 * Get all machines with joined type, mode, and owner data
 * @returns Array of machines with relations
 */
export async function getMachines(): Promise<MachineDto[]> {
  const results = await db
    .select({
      id: machines.id,
      machineName: machines.machineName,
      serialNumber: machines.serialNumber,
      productionYear: machines.productionYear,
      compartmentCount: machines.compartmentCount,
      machineDateCreated: machines.machineDateCreated,
      latitude: machines.latitude,
      longitude: machines.longitude,
      machineModeId: machines.machineModeId,
      machineTypeId: machines.machineTypeId,
      ownerId: machines.ownerId,
      machineTypeName: machineTypes.machineTypeName,
      machineModeName: machineModes.machineModeName,
      ownerName: user.name,
    })
    .from(machines)
    .leftJoin(machineTypes, eq(machines.machineTypeId, machineTypes.id))
    .leftJoin(machineModes, eq(machines.machineModeId, machineModes.id))
    .leftJoin(user, eq(machines.ownerId, user.id));

  return results;
}

/**
 * Get all machine types
 * @returns Array of machine types
 */
export async function getMachineTypes(): Promise<MachineTypeDto[]> {
  const results = await db.select().from(machineTypes);
  return results;
}

/**
 * Get all machine modes
 * @returns Array of machine modes
 */
export async function getMachineModes(): Promise<MachineModeDto[]> {
  const results = await db.select().from(machineModes);
  return results;
}

/**
 * Create machine payload type
 */
export type CreateMachineDto = {
  machineName: string;
  serialNumber: string;
  productionYear: number;
  machineModeId: number;
  machineTypeId: number;
  compartmentCount: number;
};

/**
 * Create a new machine
 * @param payload Machine data
 * @returns Created machine id
 */
export async function createMachine(
  payload: CreateMachineDto
): Promise<{ id: number }> {
  // Check for duplicate serial number
  const existingMachine = await db
    .select({ id: machines.id })
    .from(machines)
    .where(eq(machines.serialNumber, payload.serialNumber))
    .limit(1);

  if (existingMachine.length > 0) {
    throw new Error('Machine with this serial number already exists');
  }

  // Get machine type name for validation
  const [machineType] = await db
    .select({ machineTypeName: machineTypes.machineTypeName })
    .from(machineTypes)
    .where(eq(machineTypes.id, payload.machineTypeId))
    .limit(1);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!machineType) {
    throw new Error('Invalid machine type');
  }

  // Validate compartment count for lockbox machines
  if (machineType.machineTypeName === 'lockbox') {
    if (!payload.compartmentCount || payload.compartmentCount <= 0) {
      throw new Error('Compartment count is required for lockbox machines');
    }
  }

  // Insert the machine
  const [machine] = await db
    .insert(machines)
    .values({
      machineName: payload.machineName,
      serialNumber: payload.serialNumber,
      productionYear: payload.productionYear,
      machineModeId: payload.machineModeId,
      machineTypeId: payload.machineTypeId,
      compartmentCount: payload.compartmentCount || 0,
    })
    .returning();

  // Create compartments for lockbox machines
  if (
    machineType.machineTypeName === 'lockbox' &&
    payload.compartmentCount > 0
  ) {
    const compartmentsToInsert = Array.from(
      { length: payload.compartmentCount },
      (_, index) => ({
        machineId: machine.id,
        compartmentNumber: index + 1,
      })
    );

    await db.insert(compartments).values(compartmentsToInsert);
  }

  return { id: machine.id };
}
