import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { symbolsQueryOptions } from './-symbols.queries';
import { getColumns } from './-components/columns';
import SymbolsList from './-components/symbol-list';

export const Route = createFileRoute('/_auth/symbols/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(symbolsQueryOptions());
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: SymbolsIndex,
});

function SymbolsIndex() {
  const { data: symbols } = useSuspenseQuery(symbolsQueryOptions());
  const columns = getColumns();

  return <SymbolsList symbols={symbols} tableColumns={columns} />;
}
