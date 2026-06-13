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
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';

/**
 * Get all compartments by machine ID
 * @returns Array of compartments with joined relations
 */
export const getCompartmentsByMachine = createServerFn({
  method: 'GET',
})
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator((data: { machineId: string }) => data)
  .handler(async ({ context, data }): Promise<CompartmentDto[]> => {
    return fetchCompartmentsByMachine(
      data.machineId,
      context.user.id,
      context.user.role
    );
  });

/**
 * Update compartment price
 */
export const updatePrice = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(
    (data: { id: string; newPrice: number; updateAll: boolean }) => data
  )
  .handler(async ({ context, data }): Promise<void> => {
    await updateCompartmentPrice(
      data.id,
      data.newPrice,
      data.updateAll,
      context.user.id
    );
  });

/**
 * Update compartment managed by
 */
export const updateManagedBy = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator((data: { id: string; managedBy: string | null }) => data)
  .handler(async ({ data }): Promise<void> => {
    await updateCompartmentManagedBy(data.id, data.managedBy);
  });

/**
 * Update compartment discount
 */
export const updateDiscount = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(
    (data: {
      id: string;
      discountValue: number;
      discountDay: number;
      expirationDate: string;
    }) => data
  )
  .handler(async ({ data }): Promise<void> => {
    await updateCompartmentDiscount(
      data.id,
      data.discountValue,
      data.discountDay,
      data.expirationDate
    );
  });
