import { createFileRoute } from '@tanstack/react-router';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#/server/db';
import { member, user } from '@vending/auth';
import { organizationServiceCredentials } from '@vending/db';
import {
  requireEdgeContext,
  verifyServicePin,
} from '#/server/smartfridge/edge-auth';
import { serverEnv } from '#/config/env';
import {
  assertLoginAllowed,
  clearLoginFailures,
  recordLoginFailure,
} from '#/server/smartfridge/login-rate-limit';

const schema = z
  .object({ username: z.string().email(), pin: z.string().regex(/^\d{6,12}$/) })
  .strict();

export const Route = createFileRoute('/api/edge/v1/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const edge = await requireEdgeContext(request);
        const input = schema.parse(await request.json());
        const username = input.username.trim().toLowerCase();
        const rateLimitKey = `${edge.edgeDeviceId}:${username}`;
        assertLoginAllowed(
          rateLimitKey,
          serverEnv().SMART_FRIDGE_EDGE_LOGIN_RATE_LIMIT
        );

        const [row] = await db
          .select({
            userId: user.id,
            displayName: user.name,
            username: user.email,
            banned: user.banned,
            role: organizationServiceCredentials.role,
            permissions: organizationServiceCredentials.permissions,
            pinVerifier: organizationServiceCredentials.pinVerifier,
            pinSalt: organizationServiceCredentials.pinSalt,
            enabled: organizationServiceCredentials.enabled,
            offlineAuthorizedUntil:
              organizationServiceCredentials.offlineAuthorizedUntil,
            authorizationVersion:
              organizationServiceCredentials.authorizationVersion,
          })
          .from(organizationServiceCredentials)
          .innerJoin(user, eq(user.id, organizationServiceCredentials.userId))
          .innerJoin(
            member,
            and(
              eq(member.userId, user.id),
              eq(member.organizationId, edge.organizationId)
            )
          )
          .where(
            and(
              eq(
                organizationServiceCredentials.organizationId,
                edge.organizationId
              ),
              eq(user.email, username),
              isNull(organizationServiceCredentials.revokedAt)
            )
          )
          .limit(1);

        const valid =
          row &&
          !row.banned &&
          row.enabled &&
          row.offlineAuthorizedUntil > new Date() &&
          verifyServicePin(input.pin, row.pinVerifier, row.pinSalt);

        if (!valid) {
          recordLoginFailure(rateLimitKey);
          return Response.json(
            { code: 'AUTHORIZATION_FAILED' },
            { status: 401 }
          );
        }

        clearLoginFailures(rateLimitKey);
        return Response.json({
          ok: true,
          userId: row.userId,
          username: row.username,
          displayName: row.displayName,
          role: row.role,
          organizationId: edge.organizationId,
          machineId: edge.machineId,
          smartFridgeId: edge.smartFridgeId,
          permissions: row.permissions,
          offlineAuthorizedUntil: row.offlineAuthorizedUntil,
          authorizationVersion: row.authorizationVersion,
          updatedAt: new Date().toISOString(),
          enabled: true,
        });
      },
    },
  },
});
