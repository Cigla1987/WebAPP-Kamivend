import { queryOptions } from '@tanstack/react-query';
import { getSymbolsFn } from './-symbols.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function symbolsQueryOptions() {
  return queryOptions({
    queryKey: ['symbols'] as const,
    queryFn: getSymbolsFn,
    staleTime: ONE_MINUTE,
  });
}
