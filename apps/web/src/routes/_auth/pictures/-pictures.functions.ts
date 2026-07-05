/**
 * Pictures API Functions
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
    return getPictures(context.user, context.activeOrganization);
  });

export const createPictureFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .validator(createPictureApiSchema)
  .handler(async ({ data, context }): Promise<PictureDto> => {
    return createPicture(data, context.user, context.activeOrganization);
  });

export const deletePictureFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .validator(deletePictureApiSchema)
  .handler(async ({ data, context }): Promise<void> => {
    return deletePicture(data, context.user, context.activeOrganization);
  });
