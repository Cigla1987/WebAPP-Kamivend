import { type FC } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import TabbedList from '#/client/components/custom/tabbed-list';
import type { ProductDto } from '../-products.server';

interface ProductsListProps {
  products: ProductDto[];
  tableColumns: ColumnDef<ProductDto>[];
}

const ProductsList: FC<ProductsListProps> = ({ products, tableColumns }) => {
  const tabs = [
    {
      label: 'All',
      value: 'all',
      title: 'All products',
      description: 'Manage all your products and view their sales performance.',
    },
  ];

  return (
    <TabbedList
      data={products}
      tabs={tabs}
      columns={tableColumns}
    />
  );
};

export default ProductsList;
