/**
 * Users API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from users.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import { fetchUsersByOwner } from './-users.server';
import type { UserDto } from './-users.server';
import { getRequest } from '@tanstack/react-start/server';
import { auth } from '#/server/lib/auth';

/**
 * Get users by owner ID
 * @returns Array of users belonging to an owner
 */
export const getUsersByOwner = createServerFn({
  method: 'GET',
})
  .inputValidator((data: { ownerId: string }) => data)
  .handler(async ({ data }): Promise<UserDto[]> => {
    const request = getRequest();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) throw new Error('Not authenticated');

    return fetchUsersByOwner(data.ownerId);
  });
