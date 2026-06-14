import { type FC } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import TabbedList from '#/client/components/custom/tabbed-list';
import type { ProductDto } from '../-products.server';
import CreateProduct from './create-product';

interface ProductsListProps {
  products: ProductDto[];
  tableColumns: ColumnDef<ProductDto>[];
}

const ProductsList: FC<ProductsListProps> = ({ products, tableColumns }) => {
  return (
    <TabbedList
      data={products}
      columns={tableColumns}
      actions={<CreateProduct />}
    />
  );
};

export default ProductsList;
