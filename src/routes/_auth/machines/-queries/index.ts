import { getMachines, getMachineTypes } from '../-api';
import type {
  MachineWithTypeName,
  MachineType,
} from '#/shared/schemas/machines';

export const machineQueries = {
  getMachines: () => ({
    queryKey: ['machines'] as const,
    queryFn: (): Promise<MachineWithTypeName[]> => getMachines(),
  }),
  getMachineTypes: () => ({
    queryKey: ['machineTypes'] as const,
    queryFn: (): Promise<MachineType[]> => getMachineTypes(),
  }),
};
