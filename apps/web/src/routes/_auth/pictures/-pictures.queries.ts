import { queryOptions } from '@tanstack/react-query';
import { getPicturesFn } from './-pictures.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function picturesQueryOptions() {
  return queryOptions({
    queryKey: ['pictures'] as const,
    queryFn: getPicturesFn,
    staleTime: ONE_MINUTE,
  });
}
