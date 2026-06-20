import { createFileRoute, Outlet } from '@tanstack/react-router';
import { isOrgMember } from '#/utils/permissions';

export const Route = createFileRoute('/_auth/members')({
  staticData: { title: 'Members' },
  beforeLoad: ({ context }) => {
    if (!isOrgMember(context.memberRole)) {
      throw new Error('Forbidden');
    }
  },
  component: MembersRoute,
});

function MembersRoute() {
  return <Outlet />;
}
