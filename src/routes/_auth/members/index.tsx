import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import {
  membersQueryOptions,
  pendingInvitationsQueryOptions,
} from './-members.queries';
import { getColumns } from './-components/columns';
import { getInvitationColumns } from './-components/invitation-columns';
import MembersList from './-components/members-list';
import { isOwner } from '#/utils/permissions';

export const Route = createFileRoute('/_auth/members/')({
  loader: async ({ context: { queryClient, memberRole } }) => {
    await Promise.all([
      queryClient.ensureQueryData(membersQueryOptions()),
      ...(isOwner(memberRole)
        ? [queryClient.ensureQueryData(pendingInvitationsQueryOptions())]
        : []),
    ]);
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: MembersIndex,
});

function MembersIndex() {
  const { data: members } = useSuspenseQuery(membersQueryOptions());
  const { memberRole } = Route.useRouteContext();

  const { data: invitations = [] } = useQuery({
    ...pendingInvitationsQueryOptions(),
    enabled: isOwner(memberRole),
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
