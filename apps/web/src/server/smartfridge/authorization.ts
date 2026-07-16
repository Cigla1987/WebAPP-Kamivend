import { and, eq } from 'drizzle-orm';
import { db } from '#/server/db';
import { compartments, machineTypes, machines } from '@vending/db';
import { MachineType, UserRole } from '@vending/domain';

export async function requireMachineAccess(
  machineId: string,
  role: string,
  organizationId?: string | null,
  type?: MachineType
) {
  const conditions = [eq(machines.id, machineId)];
  if (role !== UserRole.Admin) {
    if (!organizationId) throw new Error('Machine not found or access denied.');
    conditions.push(eq(machines.organizationId, organizationId));
  }
  const [row] = await db
    .select({
      id: machines.id,
      organizationId: machines.organizationId,
      type: machineTypes.machineTypeName,
      enabled: machines.enabled,
    })
    .from(machines)
    .innerJoin(machineTypes, eq(machineTypes.id, machines.machineTypeId))
    .where(and(...conditions))
    .limit(1);
  if (!row || (type && row.type !== type))
    throw new Error('Machine not found or access denied.');
  return row;
}
export async function requireCompartmentAccess(
  compartmentId: string,
  role: string,
  organizationId?: string | null
) {
  const [row] = await db
    .select({
      id: compartments.id,
      machineId: machines.id,
      organizationId: machines.organizationId,
    })
    .from(compartments)
    .innerJoin(machines, eq(machines.id, compartments.machineId))
    .where(eq(compartments.id, compartmentId))
    .limit(1);
  if (
    !row ||
    (role !== UserRole.Admin &&
      (!organizationId || row.organizationId !== organizationId))
  )
    throw new Error('Machine not found or access denied.');
  return row;
}
