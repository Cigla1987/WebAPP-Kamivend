import { auth } from '#/server/lib/auth';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { db } from '#/server/db';
import { and, eq } from 'drizzle-orm';
import { organization, member } from '@vending/db';
import { UserRole } from '@vending/domain';

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw redirect({ to: '/login' });
    }

    const activeOrganizationId = session.session.activeOrganizationId;
    let activeOrganization = null;
    let memberRole: string | null = null;

    if (activeOrganizationId) {
      const isPlatformAdmin = session.user.role === UserRole.Admin;

      if (isPlatformAdmin) {
        const [org] = await db
          .select()
          .from(organization)
          .where(eq(organization.id, activeOrganizationId))
          .limit(1);
        activeOrganization = org ?? null;
      } else {
        const [membership] = await db
          .select({
            role: member.role,
            organization,
          })
          .from(member)
          .innerJoin(
            organization,
            eq(organization.id, member.organizationId)
          )
          .where(
            and(
              eq(member.organizationId, activeOrganizationId),
              eq(member.userId, session.user.id)
            )
          )
          .limit(1);

        if (membership) {
          activeOrganization = membership.organization;
          memberRole = membership.role;
        }
      }
    }

    return {
      ...session,
      activeOrganization,
      memberRole,
    };
  }
);
