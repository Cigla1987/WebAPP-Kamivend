import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/members')({
  component: MembersRoute,
});

function MembersRoute() {
  return <Outlet />;
}
