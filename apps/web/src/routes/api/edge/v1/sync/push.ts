import { createFileRoute } from '@tanstack/react-router';
import { and, eq } from 'drizzle-orm';
import { db } from '#/server/db';
import { smartFridgePushReceipts } from '@vending/db';
import { requireEdgeContext } from '#/server/smartfridge/edge-auth';
export const Route = createFileRoute('/api/edge/v1/sync/push')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const edge = await requireEdgeContext(request);
        const body = (await request.json()) as any;
        const events = Array.isArray(body.events)
          ? body.events
          : Array.isArray(body.records)
            ? body.records
            : [];
        const accepted: string[] = [];
        const duplicates: string[] = [];
        const rejected: Array<{ eventId: string; reason: string }> = [];
        await db.transaction(async (tx) => {
          for (const e of events.slice(0, 100)) {
            const eventId = String(e.eventId || e.idempotencyId || e.id || '');
            if (!eventId) {
              rejected.push({ eventId: '', reason: 'INVALID_EVENT' });
              continue;
            }
            const [seen] = await tx
              .select({ id: smartFridgePushReceipts.id })
              .from(smartFridgePushReceipts)
              .where(
                and(
                  eq(smartFridgePushReceipts.edgeDeviceId, edge.edgeDeviceId),
                  eq(smartFridgePushReceipts.eventId, eventId)
                )
              )
              .limit(1);
            if (seen) {
              duplicates.push(eventId);
              continue;
            }
            await tx
              .insert(smartFridgePushReceipts)
              .values({
                edgeDeviceId: edge.edgeDeviceId,
                smartFridgeId: edge.smartFridgeId,
                eventId,
                entityType: String(e.entityType || 'unknown'),
                entityId: String(e.entityId || ''),
                operation: String(e.operation || 'upsert'),
                payload: e.payload || null,
                accepted: true,
              });
            accepted.push(eventId);
          }
        });
        return Response.json({
          accepted,
          acceptedIds: accepted,
          duplicates,
          rejected,
          serverTime: new Date().toISOString(),
        });
      },
    },
  },
});
