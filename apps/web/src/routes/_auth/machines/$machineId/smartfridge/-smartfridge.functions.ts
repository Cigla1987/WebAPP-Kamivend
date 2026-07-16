import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';
import { getSmartFridgeOverview } from './-smartfridge.server';
import type { SmartFridgeOverview } from './-smartfridge.server';

const machineInputSchema = z.object({
  machineId: z.uuid('Machine ID must be a valid UUID'),
});

export const getSmartFridgeOverviewFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .validator(machineInputSchema)
  .handler(async ({ data, context }): Promise<SmartFridgeOverview> => {
    return getSmartFridgeOverview(
      data.machineId,
      context.user,
      context.activeOrganization
    );
  });
