import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '#/client/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import Actions from './actions';
import type { ProductDto } from '../-products.server';

export const getColumns = (): ColumnDef<ProductDto>[] => {
  return [
    {
      accessorKey: 'id',
      sortingFn: 'basic',
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
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
        const id: number = row.getValue('id');
        return <div className="text-center font-medium">{id}</div>;
      },
    },
    {
      accessorKey: 'productPicture',
      header: () => <div className="text-center">Picture</div>,
      cell: ({ row }) => {
        const productPicture: string | null = row.getValue('productPicture');
        return (
          <div className="flex justify-center text-center">
            {productPicture ? (
              <img
                src={productPicture}
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
      accessorKey: 'productSymbolPicture',
      header: () => <div className="text-center">Symbol</div>,
      cell: ({ row }) => {
        const productSymbolPicture: string | null = row.getValue(
          'productSymbolPicture'
        );
        return (
          <div className="flex justify-center text-center">
            {productSymbolPicture ? (
              <img
                src={productSymbolPicture}
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
      accessorKey: 'defaultPrice',
      header: () => <div className="text-center">Default price</div>,
      cell: ({ row }) => {
        const defaultPrice: string = row.getValue('defaultPrice');
        return <div className="text-center font-medium">{defaultPrice}</div>;
      },
    },
    {
      accessorKey: 'currencySymbol',
      header: () => <div className="text-center">Currency symbol</div>,
      cell: ({ row }) => {
        const currencySymbol: string = row.getValue('currencySymbol');
        return <div className="text-center font-medium">{currencySymbol}</div>;
      },
    },
    {
      accessorKey: 'defaultQuantity',
      header: () => <div className="text-center">Default quantity</div>,
      cell: ({ row }) => {
        const defaultQuantity: string = row.getValue('defaultQuantity');
        return (
          <div className="text-center font-medium">{defaultQuantity}</div>
        );
      },
    },
    {
      accessorKey: 'unitSymbol',
      header: () => <div className="text-center">Unit symbol</div>,
      cell: ({ row }) => {
        const unitSymbol: string = row.getValue('unitSymbol');
        return <div className="text-center font-medium">{unitSymbol}</div>;
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
      accessorKey: 'productDateCreated',
      header: () => <div className="text-center">Date created</div>,
      cell: ({ row }) => {
        const productDateCreated: Date = new Date(
          row.getValue('productDateCreated')
        );
        const formattedDate = productDateCreated.toLocaleDateString('hr-HR');
        return <div className="text-center font-medium">{formattedDate}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <Actions productId={row.original.id} />,
    },
  ];
};

export const useColumns = (): ColumnDef<ProductDto>[] => {
  return getColumns();
};
