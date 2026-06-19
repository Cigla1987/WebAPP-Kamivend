import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import {
  membersQueryOptions,
  pendingInvitationsQueryOptions,
} from './-members.queries';
import { getColumns } from './-components/columns';
import { getInvitationColumns } from './-components/invitation-columns';
import MembersList from './-components/members-list';
import { UserRole, MemberRole } from '#/shared/enums';

export const Route = createFileRoute('/_auth/members/')({
  loader: async ({ context: { queryClient, user, memberRole } }) => {
    const isOwner =
      memberRole === MemberRole.Owner || user.role === UserRole.Admin;

    const promises = [queryClient.ensureQueryData(membersQueryOptions())];

    if (isOwner) {
      promises.push(queryClient.ensureQueryData(pendingInvitationsQueryOptions()));
    }

    await Promise.all(promises);
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: MembersIndex,
});

function MembersIndex() {
  const { data: members } = useSuspenseQuery(membersQueryOptions());
  const { user, memberRole } = Route.useRouteContext();
  const isOwner =
    memberRole === MemberRole.Owner || user.role === UserRole.Admin;

  const { data: invitations = [] } = useQuery({
    ...pendingInvitationsQueryOptions(),
    enabled: isOwner,
  });

  const columns = getColumns();
  const invitationColumns = getInvitationColumns();

  return (
    <MembersList
      members={members}
      tableColumns={columns}
      invitations={invitations}
      invitationColumns={invitationColumns}
    />
  );
}
