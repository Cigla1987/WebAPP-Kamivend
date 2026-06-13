/**
 * Compartment API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from compartments.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import {
  fetchCompartmentsByMachine,
  updateCompartmentPrice,
  updateCompartmentManagedBy,
  updateCompartmentDiscount,
} from './-compartments.server';
import type { CompartmentDto } from './-compartments.server';
import { getRequest } from '@tanstack/react-start/server';
import { auth } from '#/server/lib/auth';

/**
 * Get all compartments by machine ID
 * @returns Array of compartments with joined relations
 */
export const getCompartmentsByMachine = createServerFn({
  method: 'GET',
})
  .inputValidator((data: { machineId: string }) => data)
  .handler(async ({ data }): Promise<CompartmentDto[]> => {
    const request = getRequest();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) throw new Error('Not authenticated');

    return fetchCompartmentsByMachine(
      data.machineId,
      session.user.id,
      session.user.role
    );
  });

/**
 * Update compartment price
 */
export const updatePrice = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { id: string; newPrice: number; updateAll: boolean }) => data
  )
  .handler(async ({ data }): Promise<void> => {
    const request = getRequest();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) throw new Error('Not authenticated');

    await updateCompartmentPrice(
      data.id,
      data.newPrice,
      data.updateAll,
      session.user.id
    );
  });

/**
 * Update compartment managed by
 */
export const updateManagedBy = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; managedBy: string | null }) => data)
  .handler(async ({ data }): Promise<void> => {
    const request = getRequest();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) throw new Error('Not authenticated');

    await updateCompartmentManagedBy(data.id, data.managedBy);
  });

/**
 * Update compartment discount
 */
export const updateDiscount = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: string;
      discountValue: number;
      discountDay: number;
      expirationDate: string;
    }) => data
  )
  .handler(async ({ data }): Promise<void> => {
    const request = getRequest();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) throw new Error('Not authenticated');

    await updateCompartmentDiscount(
      data.id,
      data.discountValue,
      data.discountDay,
      data.expirationDate
    );
  });
