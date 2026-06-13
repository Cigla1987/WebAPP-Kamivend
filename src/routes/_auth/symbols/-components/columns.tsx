import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '#/client/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import type { SymbolDto } from '../-symbols.server';

export const getColumns = (): ColumnDef<SymbolDto>[] => {
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
      accessorKey: 'symbolName',
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => {
        const symbolName: string = row.getValue('symbolName');
        return (
          <div className="text-center font-medium">{symbolName}</div>
        );
      },
    },
    {
      accessorKey: 'symbolPicture',
      header: () => <div className="text-center">Picture</div>,
      cell: ({ row }) => {
        const symbolPicture = row.getValue('symbolPicture') as string;
        return symbolPicture ? (
          <div className="flex justify-center text-center">
            <img
              src={symbolPicture}
              alt="Symbol"
              className="h-24 w-24 rounded-full object-cover"
            />
          </div>
        ) : (
          'No Image'
        );
      },
    },
  ];
};
