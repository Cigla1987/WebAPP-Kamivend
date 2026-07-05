/**
 * ⚠️ SERVER-ONLY FILE
 */

import { db } from '#/server/db';
import { user, member, organization } from '@vending/auth';
import { eq, and } from 'drizzle-orm';
import { MemberRole } from '@vending/domain';
export type UserDto = {
  id: string;
  username: string;
};

export type OwnerDto = {
  id: string;
  name: string;
};

export type OrganizationSummaryDto = {
  id: string;
  name: string;
};

export async function fetchUsersByOrganization(
  orgId: string
): Promise<UserDto[]> {
  const results = await db
    .select({
      id: user.id,
      username: user.name,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, orgId));

  return results;
}

export async function fetchAllOwners(): Promise<OwnerDto[]> {
  const results = await db
    .select({
      id: user.id,
      name: user.name,
    })
    .from(user)
    .innerJoin(member, eq(member.userId, user.id))
    .where(eq(member.role, MemberRole.Owner))
    .groupBy(user.id, user.name);

  return results;
}

export async function fetchOrganizationsByOwner(
  ownerId: string
): Promise<OrganizationSummaryDto[]> {
  const results = await db
    .select({
      id: organization.id,
      name: organization.name,
    })
    .from(organization)
    .innerJoin(member, eq(member.organizationId, organization.id))
    .where(
      and(
        eq(member.userId, ownerId),
        eq(member.role, MemberRole.Owner)
      )
    );

  return results;
}
