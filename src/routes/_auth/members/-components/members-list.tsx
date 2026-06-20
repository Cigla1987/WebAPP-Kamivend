import { type FC } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { getRouteApi } from '@tanstack/react-router';
import { isOwner as checkIsOwner } from '#/utils/permissions';
import { UserRole } from '#/shared/enums';
import {
  Card,
  CardContent,
} from '#/client/components/ui/card';
import { DataTable } from '#/client/components/ui/data-table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#/client/components/ui/tabs';
import type { MemberDto, InvitationDto } from '../-members.server';
import InviteMember from './invite-member';

const authenticatedRoute = getRouteApi('/_auth');

interface MembersListProps {
  members: MemberDto[];
  tableColumns: ColumnDef<MemberDto>[];
  invitations: InvitationDto[];
  invitationColumns: ColumnDef<InvitationDto>[];
}

const MembersList: FC<MembersListProps> = ({
  members,
  tableColumns,
  invitations,
  invitationColumns,
}) => {
  const { user, memberRole } = authenticatedRoute.useRouteContext();

  const isOwner = checkIsOwner(memberRole) || user.role === UserRole.Admin;
  const actions = isOwner && <InviteMember />;

  return (
    <div className="space-y-4">
      <div className="container mx-auto pb-10">
        <main className="px-6 py-4 sm:py-0">
          {isOwner ? (
            <Tabs defaultValue="members">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="invitations">
                    Pending Invitations
                    {invitations.length > 0 && (
                      <span className="bg-primary text-primary-foreground ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                        {invitations.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">{actions}</div>
              </div>
              <TabsContent value="members">
                <Card>
                  <CardContent>
                    <DataTable columns={tableColumns} data={members} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="invitations">
                <Card>
                  <CardContent>
                    <DataTable columns={invitationColumns} data={invitations} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent>
                <DataTable columns={tableColumns} data={members} />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default MembersList;
