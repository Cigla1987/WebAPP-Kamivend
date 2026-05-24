import { queryOptions } from '@tanstack/react-query';
import { getProductsFn } from './-products.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function productsQueryOptions() {
  return queryOptions({
    queryKey: ['products'] as const,
    queryFn: getProductsFn,
    staleTime: ONE_MINUTE,
  });
}
