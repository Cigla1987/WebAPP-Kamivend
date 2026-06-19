import { type ColumnDef } from '@tanstack/react-table';
import type { MemberDto } from '../-members.server';

export const getColumns = (): ColumnDef<MemberDto>[] => {
  return [
    {
      accessorKey: 'name',
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => {
        const name: string = row.getValue('name');
        return <div className="text-center font-medium">{name}</div>;
      },
    },
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
  ];
};
