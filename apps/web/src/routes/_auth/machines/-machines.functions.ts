/**
 * Machine API Functions
 */

import { createServerFn } from '@tanstack/react-start';
import {
  getMachines,
  getMachineTypes,
  getMachineModes,
  createMachine,
  updateMachineOwner,
  claimMachine,
  updateMachineMode,
  assignMachineApiSchema,
  claimMachineApiSchema,
  createMachineApiSchema,
  updateMachineModeApiSchema,
} from './-machines.server';
import type {
  MachineDto,
  MachineTypeDto,
  MachineModeDto,
} from './-machines.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';
import { requireRole } from '#/middleware/roles';
import { UserRole, MemberRole } from '@vending/domain';

export const getMachinesFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<MachineDto[]> => {
    return getMachines(context.user, context.activeOrganization);
  });

export const createMachineFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(UserRole.Admin)])
  .validator(createMachineApiSchema)
  .handler(
    async ({ data, context }): Promise<{ id: string; activationCode: string }> => {
      return createMachine(data, context.user);
    }
  );

export const getMachineTypesFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async (): Promise<MachineTypeDto[]> => {
    return getMachineTypes();
  });

export const getMachineModesFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async (): Promise<MachineModeDto[]> => {
    return getMachineModes();
  });

/** Platform-admin support assignment. Owners use claimMachineFn instead. */
export const assignMachineFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(UserRole.Admin)])
  .validator(assignMachineApiSchema)
  .handler(async ({ data, context }): Promise<{ machineName: string }> => {
    return updateMachineOwner(data, context.user, context.activeOrganization);
  });

export const claimMachineFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(MemberRole.Owner)])
  .validator(claimMachineApiSchema)
  .handler(
    async (
      { data, context }
    ): Promise<{ machineId: string; machineName: string }> => {
      return claimMachine(data, context.user, context.activeOrganization);
    }
  );

export const updateMachineModeFn = createServerFn({ method: 'POST' })
  .middleware([
    errorMiddlewareFn,
    requireRole(UserRole.Admin, MemberRole.Owner),
  ])
  .validator(updateMachineModeApiSchema)
  .handler(async ({ data, context }): Promise<{ machineName: string }> => {
    return updateMachineMode(
      data,
      context.user,
      context.activeOrganization
    );
  });
