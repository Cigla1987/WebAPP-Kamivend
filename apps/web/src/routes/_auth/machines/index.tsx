import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQueries } from '@tanstack/react-query';
import MachinesList from './-components/machine-list';
import {
  machinesQueryOptions,
  machineTypesQueryOptions,
} from './-machines.queries';

export const Route = createFileRoute('/_auth/machines/')({
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(machinesQueryOptions()),
      queryClient.ensureQueryData(machineTypesQueryOptions()),
    ]);
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: MachinesIndex,
});

function MachinesIndex() {
  const [machinesQuery, typesQuery] = useSuspenseQueries({
    queries: [machinesQueryOptions(), machineTypesQueryOptions()],
  });

  const machines = machinesQuery.data;
  const machineTypes = typesQuery.data;

  return <MachinesList machines={machines} machineTypes={machineTypes} />;
}
