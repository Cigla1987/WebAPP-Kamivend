/**
 * ⚠️ SERVER-ONLY FILE
 */

import { db } from '@/server/db';
import { UserRole } from '#/shared/enums';
import { organization } from '#/server/db/schema/auth';
import type { User } from '#/server/schemas/auth';

export type OrganizationDto = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
};

export async function getOrganizations(
  currentUser: Pick<User, 'id' | 'role'>
): Promise<OrganizationDto[]> {
  if (currentUser.role !== UserRole.Admin) {
    throw new Error('Unauthorized');
  }

  const results = await db.select().from(organization);

  return results;
}
