/**
 * Admin API Functions
 */

import { createServerFn } from '@tanstack/react-start';
import { getOrganizations } from './-admin.server';
import type { OrganizationDto } from './-admin.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';

export const getOrganizationsFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<OrganizationDto[]> => {
    return getOrganizations(context.user);
  });
