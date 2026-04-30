import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQueries } from '@tanstack/react-query';
import MachinesList from './-components/machine-list';
import { machineQueries } from './-queries';

export const Route = createFileRoute('/_auth/machines/')({
  loader: async ({ context: { queryClient } }) => {
    const machinesOptions = machineQueries.getMachines();
    const typesOptions = machineQueries.getMachineTypes();
    await Promise.all([
      queryClient.ensureQueryData(machinesOptions),
      queryClient.ensureQueryData(typesOptions),
    ]);
  },
  pendingComponent: () => <p className="text-9xl text-white">loadingasdasda</p>,
  component: MachinesIndex,
});

function MachinesIndex() {
  const [machinesQuery, typesQuery] = useSuspenseQueries({
    queries: [machineQueries.getMachines(), machineQueries.getMachineTypes()],
  });

  const machines = machinesQuery.data;
  const machineTypes = typesQuery.data;

  return <MachinesList machines={machines} machineTypes={machineTypes} />;
}
