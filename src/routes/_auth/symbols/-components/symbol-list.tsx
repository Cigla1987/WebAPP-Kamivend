import { type FC } from 'react';
import TabbedList from '#/client/components/custom/tabbed-list';
import { useRouteContext } from '@tanstack/react-router';
import type { SymbolDto } from '../-symbols.server';
import CreateSymbol from './create-symbol';
import { type ColumnDef } from '@tanstack/react-table';

interface SymbolsListProps {
  symbols: SymbolDto[];
  tableColumns: ColumnDef<SymbolDto>[];
}

const SymbolsList: FC<SymbolsListProps> = ({ symbols, tableColumns }) => {
  const { user } = useRouteContext({ from: '/_auth' });
  const userRole = user.role;

  const tabs = [
    {
      label: 'All',
      value: 'all',
      title: 'Symbols',
      description: 'View and manage symbols in your organization.',
    },
  ];

  const actions = userRole === 'superadmin' && (
    <>
      <CreateSymbol />
    </>
  );

  return (
    <TabbedList
      data={symbols}
      tabs={tabs}
      columns={tableColumns}
      actions={actions}
    />
  );
};

export default SymbolsList;
