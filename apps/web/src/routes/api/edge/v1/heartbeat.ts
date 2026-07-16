import { createFileRoute } from '@tanstack/react-router';
import { eq } from 'drizzle-orm';
import { db } from '#/server/db';
import { smartFridgeDeviceCredentials, smartFridgeProfiles } from '@vending/db';
import { requireEdgeContext } from '#/server/smartfridge/edge-auth';
import { serverEnv } from '#/config/env';
export const Route = createFileRoute('/api/edge/v1/heartbeat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const edge = await requireEdgeContext(request);
        const body = (await request.json()) as any;
        const now = new Date();
        const protocol = String(body.protocolVersion || '').split('.');
        await db.transaction(async (tx) => {
          await tx
            .update(smartFridgeDeviceCredentials)
            .set({
              lastSeenAt: now,
              lastHeartbeatAt: now,
              appVersion: String(body.appVersion || '').slice(0, 40) || null,
              databaseSchemaVersion:
                String(body.databaseSchemaVersion || '').slice(0, 40) || null,
              protocolMajor: Number(protocol[0]) || null,
              protocolMinor: Number(protocol[1]) || null,
              canStatus:
                String(body.canConnectionState || body.canStatus || '').slice(
                  0,
                  40
                ) || null,
              detectedShelfCount: Number(body.detectedShelfCount) || 0,
              pendingSyncCount: Number(body.pendingOutboxCount) || 0,
              updatedAt: now,
            })
            .where(eq(smartFridgeDeviceCredentials.id, edge.edgeDeviceId));
          await tx
            .update(smartFridgeProfiles)
            .set({ lastOnlineAt: now })
            .where(eq(smartFridgeProfiles.id, edge.smartFridgeId));
        });
        return Response.json({
          ok: true,
          serverTime: now.toISOString(),
          deviceEnabled: true,
          edgeDeviceEnabled: true,
          machineEnabled: true,
          nextHeartbeatSeconds:
            serverEnv().SMART_FRIDGE_HEARTBEAT_INTERVAL_SECONDS,
        });
      },
    },
  },
});
