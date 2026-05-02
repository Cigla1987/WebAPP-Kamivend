/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { machines, machineTypes, machineModes } from '@/server/db/schema';
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
 * Get all machines with joined type, mode, and owner data
 * @returns Array of machines with relations
 */
export async function fetchMachines(): Promise<MachineDto[]> {
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
export async function fetchMachineTypes(): Promise<MachineTypeDto[]> {
  const results = await db.select().from(machineTypes);
  return results;
}
