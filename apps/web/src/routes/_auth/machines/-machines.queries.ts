import { queryOptions } from '@tanstack/react-query';
import {
  getMachinesFn,
  getMachineTypesFn,
  getMachineModesFn,
} from './-machines.functions';
import { ONE_MINUTE } from '#/utils/constants';

export function machinesQueryOptions() {
  return queryOptions({
    queryKey: ['machines'] as const,
    queryFn: () => getMachinesFn(),
    staleTime: ONE_MINUTE,
  });
}

export function machineModesQueryOptions() {
  return queryOptions({
    queryKey: ['machineModes'] as const,
    queryFn: () => getMachineModesFn(),
    staleTime: ONE_MINUTE,
  });
}

export function machineTypesQueryOptions() {
  return queryOptions({
    queryKey: ['machineTypes'] as const,
    queryFn: () => getMachineTypesFn(),
    staleTime: ONE_MINUTE,
  });
}
