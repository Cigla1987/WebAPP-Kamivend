/**
 * Symbols API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 */

import { createServerFn } from '@tanstack/react-start';
import { getSymbols } from './-symbols.server';
import type { SymbolDto } from './-symbols.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';

export const getSymbolsFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<SymbolDto[]> => {
    return getSymbols(context.user);
  });
