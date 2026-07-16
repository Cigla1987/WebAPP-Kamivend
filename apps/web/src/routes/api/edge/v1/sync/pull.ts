import { createFileRoute } from '@tanstack/react-router';
import { and, asc, eq, gt } from 'drizzle-orm';
import { db } from '#/server/db';
import { smartFridgePullChanges } from '@vending/db';
import { requireEdgeContext } from '#/server/smartfridge/edge-auth';
export const Route = createFileRoute('/api/edge/v1/sync/pull')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const edge = await requireEdgeContext(request);
        const url = new URL(request.url);
        const cursor = BigInt(url.searchParams.get('cursor') || '0');
        const limit = Math.min(
          100,
          Math.max(1, Number(url.searchParams.get('limit') || 100))
        );
        const rows = await db
          .select()
          .from(smartFridgePullChanges)
          .where(
            and(
              eq(smartFridgePullChanges.smartFridgeId, edge.smartFridgeId),
              gt(smartFridgePullChanges.cursor, cursor)
            )
          )
          .orderBy(asc(smartFridgePullChanges.cursor))
          .limit(limit + 1);
        const page = rows.slice(0, limit);
        const nextCursor = page.at(-1)?.cursor ?? cursor;
        return Response.json({
          changes: page.map((r) => ({ ...r, cursor: r.cursor.toString() })),
          cursor: nextCursor.toString(),
          nextCursor: nextCursor.toString(),
          hasMore: rows.length > limit,
        });
      },
    },
  },
});
