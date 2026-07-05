import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_auth/machines/$machineId/compartments'
)({
  staticData: { title: 'Compartments' },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
