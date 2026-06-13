import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/products')({
  staticData: { title: 'Products' },
  component: ProductsRoute,
});

function ProductsRoute() {
  return <Outlet />;
}
