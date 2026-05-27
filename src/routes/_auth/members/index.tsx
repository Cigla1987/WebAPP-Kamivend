import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { membersQueryOptions } from './-members.queries';
import { getColumns } from './-components/columns';
import MembersList from './-components/member-list';

export const Route = createFileRoute('/_auth/members/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(membersQueryOptions());
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: MembersIndex,
});

function MembersIndex() {
  const { data: members } = useSuspenseQuery(membersQueryOptions());
  const columns = getColumns();

  return <MembersList members={members} tableColumns={columns} />;
}
