import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { productsQueryOptions } from './-products.queries';
import { useColumns } from './-components/columns';
import ProductsList from './-components/product-list';

export const Route = createFileRoute('/_auth/products/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(productsQueryOptions());
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: ProductsIndex,
});

function ProductsIndex() {
  const { data: products } = useSuspenseQuery(productsQueryOptions());
  const columns = useColumns();
  return <ProductsList products={products} tableColumns={columns} />;
}
