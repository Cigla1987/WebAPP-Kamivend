import { createFileRoute } from '@tanstack/react-router';
import { and, eq, gt, isNotNull, or } from 'drizzle-orm';
import { db } from '#/server/db';
import { member, user } from '@vending/auth';
import { organizationServiceCredentials } from '@vending/db';
import { requireEdgeContext } from '#/server/smartfridge/edge-auth';
export const Route = createFileRoute('/api/edge/v1/users')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const edge = await requireEdgeContext(request);
        const cursor = new URL(request.url).searchParams.get('cursor');
        const since =
          cursor && Number(cursor) > 0 ? new Date(Number(cursor)) : new Date(0);
        const rows = await db
          .select({
            userId: user.id,
            organizationId: member.organizationId,
            username: user.email,
            displayName: user.name,
            role: organizationServiceCredentials.role,
            enabled: organizationServiceCredentials.enabled,
            pinVerifier: organizationServiceCredentials.pinVerifier,
            pinSalt: organizationServiceCredentials.pinSalt,
            offlineAuthorizedUntil:
              organizationServiceCredentials.offlineAuthorizedUntil,
            updatedAt: organizationServiceCredentials.updatedAt,
            revokedAt: organizationServiceCredentials.revokedAt,
          })
          .from(organizationServiceCredentials)
          .innerJoin(user, eq(user.id, organizationServiceCredentials.userId))
          .innerJoin(
            member,
            and(
              eq(member.userId, user.id),
              eq(
                member.organizationId,
                organizationServiceCredentials.organizationId
              )
            )
          )
          .where(
            and(
              eq(
                organizationServiceCredentials.organizationId,
                edge.organizationId
              ),
              or(
                gt(organizationServiceCredentials.updatedAt, since),
                isNotNull(organizationServiceCredentials.revokedAt)
              )
            )
          );
        const active = rows
          .filter((r) => !r.revokedAt)
          .map(({ revokedAt, ...r }) => r);
        return Response.json({
          cursor: Date.now(),
          users: active,
          revokedUserIds: rows.filter((r) => r.revokedAt).map((r) => r.userId),
        });
      },
    },
  },
});
