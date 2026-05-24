/**
 * Units API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 */

import { createServerFn } from '@tanstack/react-start';
import { getUnits } from './-units.server';
import type { UnitDto } from './-units.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';

export const getUnitsFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async (): Promise<UnitDto[]> => {
    return getUnits();
  });
