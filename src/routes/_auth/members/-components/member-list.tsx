import { type FC } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { getRouteApi } from '@tanstack/react-router';
import { UserRole } from '#/shared/enums';
import TabbedList from '#/client/components/custom/tabbed-list';
import type { MemberDto } from '../-members.server';
import AddMember from './add-member';

const authenticatedRoute = getRouteApi('/_auth');

interface MembersListProps {
  members: MemberDto[];
  tableColumns: ColumnDef<MemberDto>[];
}

const MembersList: FC<MembersListProps> = ({ members, tableColumns }) => {
  const { user } = authenticatedRoute.useRouteContext();

  // TODO: Revert to owner-only when multi-tenancy is clarified
  const actions = (user.role === UserRole.Owner ||
    user.role === UserRole.Superadmin) && <AddMember />;

  return <TabbedList data={members} columns={tableColumns} actions={actions} />;
};

export default MembersList;
