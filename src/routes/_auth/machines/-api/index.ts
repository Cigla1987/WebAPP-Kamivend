import { createServerFn } from '@tanstack/react-start';
import { db } from '@/server/db';
import { machines, machineTypes, machineModes } from '@/server/db/schema';
import { user } from '@/server/db/schema/auth';
import { eq } from 'drizzle-orm';

export const getMachines = createServerFn({ method: 'GET' }).handler(
  async () => {
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
);

export const getMachineTypes = createServerFn({ method: 'GET' }).handler(
  async () => {
    const results = await db.select().from(machineTypes);
    return results;
  }
);
