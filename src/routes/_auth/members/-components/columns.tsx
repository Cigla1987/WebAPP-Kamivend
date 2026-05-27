import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '#/client/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import type { MemberDto } from '../-members.server';

export const getColumns = (): ColumnDef<MemberDto>[] => {
  return [
    {
      accessorKey: 'id',
      sortingFn: 'basic',
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              className="hover:cursor-pointer"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const id: string = row.getValue('id');
        return <div className="text-center font-medium">{id}</div>;
      },
    },
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
