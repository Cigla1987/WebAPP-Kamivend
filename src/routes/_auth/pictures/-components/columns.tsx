import { type ColumnDef } from '@tanstack/react-table';
import Actions from './actions';
import type { PictureDto } from '../-pictures.server';

export const getColumns = (): ColumnDef<PictureDto>[] => {
  return [
    {
      accessorKey: 'pictureContent',
      header: () => <div className="text-center">Content</div>,
      cell: ({ row }) => {
        const pictureContent: string | null = row.getValue('pictureContent');

        return (
          <div className="flex justify-center text-center">
            {pictureContent && (
              <img
                src={pictureContent}
                className="h-24 w-24 rounded-full object-cover"
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'pictureName',
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => {
        const name: string = row.getValue('pictureName');
        return <div className="text-center font-medium">{name}</div>;
      },
    },
    {
      accessorKey: 'pictureOwnerId',
      header: () => <div className="text-center">Owner</div>,
      cell: ({ row }) => {
        const pictureOwnerId: string | null = row.getValue('pictureOwnerId');
        return (
          <div className="text-center font-medium">{pictureOwnerId}</div>
        );
      },
    },
    {
      accessorKey: 'pictureDateCreated',
      header: () => <div className="text-center">Date created</div>,
      cell: ({ row }) => {
        const pictureDateCreated: Date | null = row.getValue(
          'pictureDateCreated'
        );
        const formattedDate = pictureDateCreated
          ? pictureDateCreated.toLocaleDateString('hr-HR')
          : null;

        return <div className="text-center font-medium">{formattedDate}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <Actions
            pictureId={row.original.id}
            pictureName={row.original.pictureName}
          />
        );
      },
    },
  ];
};
