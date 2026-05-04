import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQueries } from '@tanstack/react-query';
import MachinesList from './-components/machine-list';
import { getMachinesFn, getMachineTypesFn } from './-machines.functions';
import type { MachineDto, MachineTypeDto } from './-machines.server';

export const Route = createFileRoute('/_auth/machines/')({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['machines'] as const,
        queryFn: () => getMachinesFn(),
      }),
      queryClient.ensureQueryData({
        queryKey: ['machineTypes'] as const,
        queryFn: () => getMachineTypesFn(),
      }),
    ]);
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: MachinesIndex,
});

function MachinesIndex() {
  const [machinesQuery, typesQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['machines'] as const,
        queryFn: (): Promise<MachineDto[]> => getMachinesFn(),
      },
      {
        queryKey: ['machineTypes'] as const,
        queryFn: (): Promise<MachineTypeDto[]> => getMachineTypesFn(),
      },
    ],
  });

  const machines = machinesQuery.data;
  const machineTypes = typesQuery.data;

  return <MachinesList machines={machines} machineTypes={machineTypes} />;
}
