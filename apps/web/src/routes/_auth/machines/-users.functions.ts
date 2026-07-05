/**
 * Users API Functions
 */

import { createServerFn } from '@tanstack/react-start';
import {
  fetchUsersByOrganization,
  fetchAllOwners,
  fetchOrganizationsByOwner,
} from './-users.server';
import type {
  UserDto,
  OwnerDto,
  OrganizationSummaryDto,
} from './-users.server';
import { authMiddlewareFn } from '#/middleware/auth';

export const getUsersByOrganization = createServerFn({
  method: 'GET',
})
  .middleware([authMiddlewareFn])
  .validator((data: { organizationId: string }) => data)
  .handler(async ({ data }): Promise<UserDto[]> => {
    return fetchUsersByOrganization(data.organizationId);
  });

export const getOwnersFn = createServerFn({ method: 'GET' })
  .middleware([authMiddlewareFn])
  .handler(async (): Promise<OwnerDto[]> => {
    return fetchAllOwners();
  });

export const getOrganizationsByOwnerFn = createServerFn({
  method: 'GET',
})
  .middleware([authMiddlewareFn])
  .validator((data: { ownerId: string }) => data)
  .handler(async ({ data }): Promise<OrganizationSummaryDto[]> => {
    return fetchOrganizationsByOwner(data.ownerId);
  });
