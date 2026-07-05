import { queryOptions } from '@tanstack/react-query';
import { getUnitsFn } from './-units.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function unitsQueryOptions() {
  return queryOptions({
    queryKey: ['units'] as const,
    queryFn: () => getUnitsFn(),
    staleTime: ONE_MINUTE,
  });
}
