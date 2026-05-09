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
} from './-machines.server';
import type {
  MachineDto,
  MachineTypeDto,
  MachineModeDto,
  CreateMachineDto,
} from './-machines.server';
import { authMiddlewareFn } from '#/middleware/auth';

export const getMachinesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddlewareFn])
  .handler(async ({ context }): Promise<MachineDto[]> => {
    return getMachines(context.user);
  });

export const createMachineFn = createServerFn({ method: 'POST' })
  .middleware([authMiddlewareFn])
  .inputValidator((data: CreateMachineDto) => data)
  .handler(async ({ data }): Promise<{ id: number }> => {
    return createMachine(data);
  });

export const getMachineTypesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddlewareFn])
  .handler(async (): Promise<MachineTypeDto[]> => {
    return getMachineTypes();
  });

export const getMachineModesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddlewareFn])
  .handler(async (): Promise<MachineModeDto[]> => {
    return getMachineModes();
  });
