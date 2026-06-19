/**
 * Symbols API Functions
 */

import { createServerFn } from '@tanstack/react-start';
import {
  getSymbols,
  createSymbol,
  createSymbolApiSchema,
} from './-symbols.server';
import type { SymbolDto } from './-symbols.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';

export const getSymbolsFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<SymbolDto[]> => {
    return getSymbols(context.user, context.activeOrganization);
  });

export const createSymbolFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(createSymbolApiSchema)
  .handler(
    async ({ data, context }): Promise<{ id: string }> => {
      return createSymbol(data, context.user, context.activeOrganization);
    }
  );
