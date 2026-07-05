import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/machines')({
  staticData: { title: 'Machines' },
  component: MachineRoute,
});

function MachineRoute() {
  return <Outlet />;
}
