import { auth } from '#/server/lib/auth';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { db } from '#/server/db';
import { eq, and } from 'drizzle-orm';
import { organization, member } from '@vending/db';

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw redirect({ to: '/login' });
    }

    // Get active organization if set
    let activeOrganization = null;
    if (session.session.activeOrganizationId) {
      const [org] = await db
        .select()
        .from(organization)
        .where(eq(organization.id, session.session.activeOrganizationId))
        .limit(1);
      activeOrganization = org || null;
    }

    // Get user's member role for active organization
    let memberRole = null;
    if (session.session.activeOrganizationId) {
      const [mem] = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.organizationId, session.session.activeOrganizationId),
            eq(member.userId, session.user.id)
          )
        )
        .limit(1);
      memberRole = mem?.role;
    }

    return {
      ...session,
      activeOrganization,
      memberRole,
    };
  }
);
