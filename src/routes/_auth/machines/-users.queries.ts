import { queryOptions } from '@tanstack/react-query';
import { getOwnersFn } from './-users.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function ownersQueryOptions() {
  return queryOptions({
    queryKey: ['owners'] as const,
    queryFn: getOwnersFn,
    staleTime: ONE_MINUTE,
  });
}
