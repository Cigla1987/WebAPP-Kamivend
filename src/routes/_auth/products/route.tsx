import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/products')({
  component: ProductsRoute,
});

function ProductsRoute() {
  return <Outlet />;
}
