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

/**
 * Get all machines with their type, mode, and owner information
 * @returns Array of machines with joined relations
 */
export const getMachinesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MachineDto[]> => {
    return getMachines();
  }
);

/**
 * Get all machine types
 * @returns Array of machine types
 */
export const getMachineTypesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MachineTypeDto[]> => {
    return getMachineTypes();
  }
);

/**
 * Get all machine modes
 * @returns Array of machine modes
 */
export const getMachineModesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MachineModeDto[]> => {
    return getMachineModes();
  }
);

/**
 * Create a new machine
 * @param data Machine creation payload
 * @returns Created machine with id
 */
export const createMachineFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateMachineDto) => data)
  .handler(async ({ data }): Promise<{ id: number }> => {
    return createMachine(data);
  });
