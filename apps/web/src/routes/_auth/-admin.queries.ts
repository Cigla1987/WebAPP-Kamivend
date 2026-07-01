import { queryOptions } from '@tanstack/react-query';
import { getOrganizationsFn } from './-admin.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function organizationsQueryOptions() {
  return queryOptions({
    queryKey: ['organizations'] as const,
    queryFn: () => getOrganizationsFn(),
    staleTime: ONE_MINUTE,
  });
}
