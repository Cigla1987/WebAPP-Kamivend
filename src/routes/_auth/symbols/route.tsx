import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/symbols')({
  staticData: { title: 'Symbols' },
  component: SymbolsRoute,
});

function SymbolsRoute() {
  return <Outlet />;
}
