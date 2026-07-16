import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_auth/machines/$machineId/smartfridge'
)({
  component: () => <Outlet />,
});
