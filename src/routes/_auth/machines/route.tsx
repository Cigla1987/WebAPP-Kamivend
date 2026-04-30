import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/machines')({
  component: MachineRoute,
});

function MachineRoute() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
