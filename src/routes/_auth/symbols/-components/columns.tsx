import { type ColumnDef } from '@tanstack/react-table';
import type { SymbolDto } from '../-symbols.server';

export const getColumns = (): ColumnDef<SymbolDto>[] => {
  return [
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
