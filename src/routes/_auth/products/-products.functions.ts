/**
 * Product API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from -products.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import {
  getProducts,
  createProduct,
  createProductApiSchema,
} from './-products.server';
import type { ProductDto } from './-products.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';

export const getProductsFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<ProductDto[]> => {
    return getProducts(context.user);
  });

export const createProductFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(createProductApiSchema)
  .handler(async ({ data, context }): Promise<ProductDto> => {
    return createProduct(data, context.user);
  });
