import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { pairEdgeDevice } from '#/server/smartfridge/edge-auth';
const schema = z
  .object({
    pairingCode: z.string().min(6).max(128),
    deviceName: z.string().min(1).max(120),
    appVersion: z.string().min(1).max(40),
  })
  .strict();
export const Route = createFileRoute('/api/edge/v1/pair')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return Response.json(
            await pairEdgeDevice(schema.parse(await request.json()))
          );
        } catch (error) {
          return Response.json(
            {
              code:
                error instanceof Error ? error.message : 'PAIRING_CODE_INVALID',
            },
            { status: 400 }
          );
        }
      },
    },
  },
});
