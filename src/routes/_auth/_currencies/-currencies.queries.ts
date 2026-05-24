import { queryOptions } from '@tanstack/react-query';
import { getCurrenciesFn } from './-currencies.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function currenciesQueryOptions() {
  return queryOptions({
    queryKey: ['currencies'] as const,
    queryFn: getCurrenciesFn,
    staleTime: ONE_MINUTE,
  });
}
