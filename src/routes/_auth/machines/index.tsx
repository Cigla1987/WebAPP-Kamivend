import { createFileRoute } from '@tanstack/react-router';
import MachinesList from './-components/machine-list';
import { getMachinesFn, getMachineTypesFn } from './-machines.functions';

export const Route = createFileRoute('/_auth/machines/')({
  loader: async () => {
    const [machines, machineTypes] = await Promise.all([
      getMachinesFn(),
      getMachineTypesFn(),
    ]);
    return { machines, machineTypes };
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: MachinesIndex,
});

function MachinesIndex() {
  const { machines, machineTypes } = Route.useLoaderData();
  return <MachinesList machines={machines} machineTypes={machineTypes} />;
}
