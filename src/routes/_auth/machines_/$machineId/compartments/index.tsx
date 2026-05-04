import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getCompartmentsByMachine } from './-compartments.functions';
import { useColumns } from './-components/columns';
import CompartmentsList from './-components/compartment-list';
import type { CompartmentDto } from './-compartments.server';

export const Route = createFileRoute(
  '/_auth/machines_/$machineId/compartments/'
)({
  loader: async ({ params, context: { queryClient } }) => {
    const { machineId } = params;

    // Ensure data is loaded before component renders
    await queryClient.ensureQueryData({
      queryKey: ['compartments', 'byMachine', machineId],
      queryFn: () =>
        getCompartmentsByMachine({ data: { machineId: Number(machineId) } }),
    });
    return { machineId };
  },
  component: IndexComponent,
  pendingComponent: () => (
    <p className="text-9xl text-white">comaparts loading</p>
  ),
});

function IndexComponent() {
  const { machineId } = Route.useLoaderData();
  const { data: compartments } = useSuspenseQuery({
    queryKey: ['compartments', 'byMachine', machineId],
    queryFn: () =>
      getCompartmentsByMachine({ data: { machineId: Number(machineId) } }),
  });
  const columns = useColumns();

  return (
    <CompartmentsList
      compartments={compartments as CompartmentDto[]}
      tableColumns={columns}
    />
  );
}
