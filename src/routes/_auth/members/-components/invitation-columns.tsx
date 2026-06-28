import { type ColumnDef } from '@tanstack/react-table';
import type { InvitationDto } from '../-members.server';
import CopyButton from '#/client/components/custom/copy-button';

export const getInvitationColumns = (): ColumnDef<InvitationDto>[] => {
  return [
    {
      accessorKey: 'email',
      header: () => <div className="text-center">Email</div>,
      cell: ({ row }) => {
        const email: string = row.getValue('email');
        return <div className="text-center font-medium">{email}</div>;
      },
    },
    {
      accessorKey: 'role',
      header: () => <div className="text-center">Role</div>,
      cell: ({ row }) => {
        const role: string = row.getValue('role');
        return <div className="text-center font-medium">{role}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const status: string = row.getValue('status');
        return (
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              {status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'expiresAt',
      header: () => <div className="text-center">Expires</div>,
      cell: ({ row }) => {
        const date: Date = row.getValue('expiresAt');
        return (
          <div className="text-center text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: 'inviteUrl',
      header: () => <div className="text-center">Invite URL</div>,
      cell: ({ row }) => {
        const url: string = row.getValue('inviteUrl');
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {url}
            </span>
            <CopyButton text={url} />
          </div>
        );
      },
    },
  ];
};
