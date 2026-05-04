/**
 * Machine API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from machines.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
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

export const getMachinesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MachineDto[]> => {
    const request = getRequest();
    return getMachines(request);
  }
);

export const createMachineFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateMachineDto) => data)
  .handler(async ({ data }): Promise<{ id: number }> => {
    return createMachine(data);
  });

export const getMachineTypesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MachineTypeDto[]> => {
    return getMachineTypes();
  }
);

export const getMachineModesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MachineModeDto[]> => {
    return getMachineModes();
  }
);
