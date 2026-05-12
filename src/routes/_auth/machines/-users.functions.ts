/**
 * Users API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from users.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import { fetchUsersByOwner, fetchAllOwners } from './-users.server';
import type { UserDto, OwnerDto } from './-users.server';
import { authMiddlewareFn } from '#/middleware/auth';

/**
 * Get users by owner ID
 * @returns Array of users belonging to an owner
 */
export const getUsersByOwner = createServerFn({
  method: 'GET',
})
  .middleware([authMiddlewareFn])
  .inputValidator((data: { ownerId: string }) => data)
  .handler(async ({ data }): Promise<UserDto[]> => {
    return fetchUsersByOwner(data.ownerId);
  });

/**
 * Get all users with role 'owner'
 * @returns Array of all owners
 */
export const getOwnersFn = createServerFn({ method: 'GET' })
  .middleware([authMiddlewareFn])
  .handler(async (): Promise<OwnerDto[]> => {
    return fetchAllOwners();
  });
