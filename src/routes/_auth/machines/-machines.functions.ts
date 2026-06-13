/**
 * Machine API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from machines.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import {
  getMachines,
  getMachineTypes,
  getMachineModes,
  createMachine,
  updateMachineOwner,
  updateMachineMode,
  assignMachineApiSchema,
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

export const getMachinesFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<MachineDto[]> => {
    return getMachines(context.user);
  });

export const createMachineFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(createMachineApiSchema)
  .handler(async ({ data }): Promise<{ id: string }> => {
    return createMachine(data);
  });

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

export const assignMachineFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(assignMachineApiSchema)
  .handler(async ({ data }): Promise<{ machineName: string }> => {
    return updateMachineOwner(data);
  });

export const updateMachineModeFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(updateMachineModeApiSchema)
  .handler(async ({ data }): Promise<{ machineName: string }> => {
    return updateMachineMode(data);
  });
