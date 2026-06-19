/**
 * ⚠️ SERVER-ONLY FILE
 */

import { db } from '@/server/db';
import { UserRole, MemberRole } from '#/shared/enums';
import {
  user,
  member,
  organization,
  invitation,
} from '#/server/db/schema/auth';
import { eq, and } from 'drizzle-orm';
import { auth } from '#/server/lib/auth';
import type { User } from '#/server/schemas/auth';
import z from 'zod';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { serverEnv } from '#/config/env';

const env = serverEnv();

export type MemberDto = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | null;
};

export type InvitationDto = {
  id: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  inviteUrl: string;
};

export const inviteMemberApiSchema = z.object({
  email: z.email('Invalid email address'),
});

export async function getMembers(
  _currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<MemberDto[]> {
  if (!activeOrg) {
    return [];
  }

  const results = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: member.role,
      createdAt: member.createdAt,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, activeOrg.id));

  return results;
}

export async function getPendingInvitations(
  _currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<InvitationDto[]> {
  if (!activeOrg) {
    return [];
  }

  const results = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    })
    .from(invitation)
    .where(
      and(
        eq(invitation.organizationId, activeOrg.id),
        eq(invitation.status, 'pending')
      )
    );

  return results.map((inv) => ({
    ...inv,
    inviteUrl: `${env.BETTER_AUTH_URL}/invite/accept/${inv.id}`,
  }));
}

export async function inviteMember(
  data: z.infer<typeof inviteMemberApiSchema>,
  currentUser: Pick<User, 'id' | 'role'>,
  activeOrg: typeof organization.$inferSelect | null
): Promise<MemberDto> {
  if (!activeOrg) {
    throw new Error('No active organization');
  }

  // Check if user is owner or admin
  if (currentUser.role !== UserRole.Admin) {
    const [mem] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, activeOrg.id),
          eq(member.userId, currentUser.id)
        )
      )
      .limit(1);
    if (!mem || mem.role !== MemberRole.Owner) {
      throw new Error('Unauthorized');
    }
  }

  // Create invitation via better-auth
  const headers = getRequestHeaders();

  const result = await auth.api.createInvitation({
    body: {
      email: data.email,
      role: MemberRole.Employee,
      organizationId: activeOrg.id,
      resend: true,
    },
    headers,
  });

  if (!result) {
    throw new Error('Failed to create invitation');
  }

  return {
    id: result.id,
    name: data.email,
    email: data.email,
    role: MemberRole.Employee,
    createdAt: new Date(),
  };
}
