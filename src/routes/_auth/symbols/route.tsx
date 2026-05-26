import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/symbols')({
  component: SymbolsRoute,
});

function SymbolsRoute() {
  return <Outlet />;
}
