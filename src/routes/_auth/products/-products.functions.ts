/**
 * Product API Functions
 */

import { createServerFn } from '@tanstack/react-start';
import {
  getProducts,
  createProduct,
  createProductApiSchema,
  updateProductDiscount,
  updateProductDiscountApiSchema,
  updateProductPicture,
  updateProductPictureApiSchema,
} from './-products.server';
import type { ProductDto } from './-products.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';
import { requireRole } from '#/middleware/roles';
import { UserRole, MemberRole } from '#/shared/enums';

export const getProductsFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<ProductDto[]> => {
    return getProducts(context.user, context.activeOrganization);
  });

export const createProductFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(UserRole.Admin, MemberRole.Owner)])
  .inputValidator(createProductApiSchema)
  .handler(async ({ data, context }): Promise<ProductDto> => {
    return createProduct(data, context.user, context.activeOrganization);
  });

export const updateProductDiscountFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(UserRole.Admin, MemberRole.Owner, MemberRole.Employee)])
  .inputValidator(updateProductDiscountApiSchema)
  .handler(async ({ data, context }): Promise<void> => {
    return updateProductDiscount(data, context.activeOrganization);
  });

export const updateProductPictureFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, requireRole(UserRole.Admin, MemberRole.Owner, MemberRole.Employee)])
  .inputValidator(updateProductPictureApiSchema)
  .handler(async ({ data, context }): Promise<void> => {
    return updateProductPicture(data, context.activeOrganization);
  });
