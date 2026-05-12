/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { user } from '@/server/db/schema/auth';
import { eq } from 'drizzle-orm';

/**
 * User with minimal fields
 */
export type UserDto = {
  id: string;
  username: string;
};

/**
 * Owner with minimal fields
 */
export type OwnerDto = {
  id: string;
  name: string;
};

/**
 * Get users by owner ID
 * @returns Array of users that belong to an owner
 */
export async function fetchUsersByOwner(ownerId: string): Promise<UserDto[]> {
  const results = await db
    .select({
      id: user.id,
      username: user.name,
    })
    .from(user)
    .where(eq(user.ownerId, ownerId));

  return results;
}

/**
 * Get all users with role 'owner'
 * @returns Array of all owners
 */
export async function fetchAllOwners(): Promise<OwnerDto[]> {
  const results = await db
    .select({
      id: user.id,
      name: user.name,
    })
    .from(user)
    .where(eq(user.role, 'owner'));

  return results;
}
