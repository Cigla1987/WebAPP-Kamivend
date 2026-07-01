import { queryOptions } from '@tanstack/react-query';
import { getOwnersFn, getOrganizationsByOwnerFn } from './-users.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function ownersQueryOptions() {
  return queryOptions({
    queryKey: ['owners'] as const,
    queryFn: () => getOwnersFn(),
    staleTime: ONE_MINUTE,
  });
}

export function organizationsByOwnerQueryOptions(ownerId: string) {
  return queryOptions({
    queryKey: ['organizations-by-owner', ownerId] as const,
    queryFn: () =>
      getOrganizationsByOwnerFn({ data: { ownerId } }),
    staleTime: ONE_MINUTE,
  });
}
