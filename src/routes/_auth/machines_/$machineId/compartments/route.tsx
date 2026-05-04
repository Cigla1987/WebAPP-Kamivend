import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_auth/machines_/$machineId/compartments'
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
