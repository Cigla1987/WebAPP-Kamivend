import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/members')({
  staticData: { title: 'Members' },
  component: MembersRoute,
});

function MembersRoute() {
  return <Outlet />;
}
