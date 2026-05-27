import { queryOptions } from '@tanstack/react-query';
import { getMembersFn } from './-members.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function membersQueryOptions() {
  return queryOptions({
    queryKey: ['members'] as const,
    queryFn: getMembersFn,
    staleTime: ONE_MINUTE,
  });
}
