/**
 * Pictures API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from -pictures.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import {
  getPictures,
  createPicture,
  deletePicture,
  createPictureApiSchema,
  deletePictureApiSchema,
} from './-pictures.server';
import type { PictureDto } from './-pictures.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';

export const getPicturesFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<PictureDto[]> => {
    return getPictures(context.user);
  });

export const createPictureFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(createPictureApiSchema)
  .handler(async ({ data, context }): Promise<PictureDto> => {
    return createPicture(data, context.user);
  });

export const deletePictureFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(deletePictureApiSchema)
  .handler(async ({ data, context }): Promise<void> => {
    return deletePicture(data, context.user);
  });
