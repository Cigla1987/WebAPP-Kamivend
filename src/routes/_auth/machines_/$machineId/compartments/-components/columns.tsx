import { type ColumnDef } from '@tanstack/react-table';
import Actions from './actions';
import type { CompartmentDto } from '../-compartments.server';

export const useColumns = (): ColumnDef<CompartmentDto>[] => {
  return [
    {
      accessorKey: 'compartmentNumber',
      header: () => <div className="text-center">Compartment no</div>,
      cell: ({ row }) => {
        const compartmentNumber: number = row.getValue('compartmentNumber');
        return (
          <div className="text-center font-medium">{compartmentNumber}</div>
        );
      },
    },
    {
      accessorKey: 'pictureContent',
      header: () => <div className="text-center">Picture</div>,
      cell: ({ row }) => {
        const picture_content: string | null = row.getValue('pictureContent');
        return (
          <div className="flex justify-center text-center">
            {picture_content ? (
              <img
                src={`${picture_content}`}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <p>No picture available</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'productName',
      header: () => <div className="text-center">Product name</div>,
      cell: ({ row }) => {
        const productName: string = row.getValue('productName');
        return <div className="text-center font-medium">{productName}</div>;
      },
    },
    {
      accessorKey: 'currentPrice',
      header: () => <div className="text-center">Current price</div>,
      cell: ({ row }) => {
        const currentPrice: string = row.getValue('currentPrice');
        return <div className="text-center font-medium">{currentPrice}</div>;
      },
    },
    {
      accessorKey: 'currencySymbol',
      header: () => <div className="text-center">Currency</div>,
      cell: ({ row }) => {
        const currencySymbol: string = row.getValue('currencySymbol');
        return <div className="text-center font-medium">{currencySymbol}</div>;
      },
    },
    {
      accessorKey: 'currentQuantity',
      header: () => <div className="text-center">Quantity</div>,
      cell: ({ row }) => {
        const currentQuantity: number = row.getValue('currentQuantity');
        return <div className="text-center font-medium">{currentQuantity}</div>;
      },
    },
    {
      accessorKey: 'unitName',
      header: () => <div className="text-center">Unit</div>,
      cell: ({ row }) => {
        const unitName: string = row.getValue('unitName');
        return <div className="text-center font-medium">{unitName}</div>;
      },
    },
    {
      accessorKey: 'discountValue',
      header: () => <div className="text-center">Discount value</div>,
      cell: ({ row }) => {
        const discountValue: number = row.getValue('discountValue');
        return <div className="text-center font-medium">{discountValue}</div>;
      },
    },
    {
      accessorKey: 'discountDay',
      header: () => <div className="text-center">Discount day</div>,
      cell: ({ row }) => {
        const discountDay: number = row.getValue('discountDay');
        return <div className="text-center font-medium">{discountDay}</div>;
      },
    },
    {
      accessorKey: 'expirationDate',
      header: () => <div className="text-center">Expiration date</div>,
      cell: ({ row }) => {
        const expirationDate: Date = new Date(row.getValue('expirationDate'));
        const formattedDate = expirationDate
          ? expirationDate.toLocaleDateString('hr-HR')
          : '-';
        return <div className="text-center font-medium">{formattedDate}</div>;
      },
    },
    {
      accessorKey: 'lastUpdated',
      header: () => <div className="text-center">Last updated</div>,
      cell: ({ row }) => {
        const lastUpdated: Date = new Date(row.getValue('lastUpdated'));
        const formattedDate = lastUpdated
          ? lastUpdated.toLocaleDateString('hr-HR')
          : '-';
        return <div className="text-center font-medium">{formattedDate}</div>;
      },
    },
    {
      accessorKey: 'managedByUsername',
      header: () => <div className="text-center">Managed by</div>,
      cell: ({ row }) => {
        const managedByUsername: string | null =
          row.getValue('managedByUsername');
        return (
          <div className="text-center font-medium">
            {managedByUsername || '-'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <Actions compartment={row.original} />,
    },
  ];
};
