/**
 * Compartment API Functions
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
import { requireRole } from '#/middleware/roles';
import { UserRole, MemberRole } from '@vending/domain';

export const getCompartmentsByMachine = createServerFn({
  method: 'GET',
})
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator((data: { machineId: string }) => data)
  .handler(async ({ context, data }): Promise<CompartmentDto[]> => {
    return fetchCompartmentsByMachine(
      data.machineId,
      context.user.role,
      context.activeOrganization
    );
  });

export const updatePrice = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(UserRole.Admin, MemberRole.Owner, MemberRole.Employee)])
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

export const updateManagedBy = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(UserRole.Admin, MemberRole.Owner)])
  .inputValidator((data: { id: string; managedBy: string | null }) => data)
  .handler(async ({ data }): Promise<void> => {
    await updateCompartmentManagedBy(data.id, data.managedBy);
  });

export const updateDiscount = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(UserRole.Admin, MemberRole.Owner, MemberRole.Employee)])
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
