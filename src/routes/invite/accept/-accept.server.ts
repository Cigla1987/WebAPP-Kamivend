/**
 * ⚠️ SERVER-ONLY FILE
 */

import { db } from '@/server/db';
import { invitation } from '@/server/db/schema/auth';
import { eq } from 'drizzle-orm';

export type InvitationDetails = {
  id: string;
  email: string;
  role: string | null;
  organizationId: string;
  status: string;
  expiresAt: Date;
};

export async function getInvitationByToken(
  token: string
): Promise<InvitationDetails | null> {
  const [inv] = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      organizationId: invitation.organizationId,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .where(eq(invitation.id, token))
    .limit(1);

  if (!inv) {
    return null;
  }

  // Check if expired
  if (new Date() > inv.expiresAt) {
    return null;
  }

  // Check if already accepted
  if (inv.status !== 'pending') {
    return null;
  }

  return inv;
}
