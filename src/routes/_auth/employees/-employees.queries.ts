import { queryOptions } from '@tanstack/react-query';
import { getEmployeesFn } from './-employees.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function employeesQueryOptions() {
  return queryOptions({
    queryKey: ['employees'] as const,
    queryFn: getEmployeesFn,
    staleTime: ONE_MINUTE,
  });
}
