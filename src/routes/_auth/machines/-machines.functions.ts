/**
 * Machine API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from machines.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import { fetchMachines, fetchMachineTypes } from './-machines.server';
import type { MachineDto, MachineTypeDto } from './-machines.server';

/**
 * Get all machines with their type, mode, and owner information
 * @returns Array of machines with joined relations
 */
export const getMachines = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MachineDto[]> => {
    return fetchMachines();
  }
);

/**
 * Get all machine types
 * @returns Array of machine types
 */
export const getMachineTypes = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MachineTypeDto[]> => {
    return fetchMachineTypes();
  }
);
