import { authMiddleware } from '#/server/middleware/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/machines')({
  component: MachineRoute,
  server: {
    middleware: [authMiddleware],
  },
});

function MachineRoute() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
