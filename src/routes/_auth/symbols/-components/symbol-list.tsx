import { type FC } from 'react';
import TabbedList from '#/client/components/custom/tabbed-list';
import { useRouteContext } from '@tanstack/react-router';
import { UserRole, MemberRole } from '#/shared/enums';
import type { SymbolDto } from '../-symbols.server';
import CreateSymbol from './create-symbol';
import { type ColumnDef } from '@tanstack/react-table';

interface SymbolsListProps {
  symbols: SymbolDto[];
  tableColumns: ColumnDef<SymbolDto>[];
}

const SymbolsList: FC<SymbolsListProps> = ({ symbols, tableColumns }) => {
  const { user, memberRole } = useRouteContext({ from: '/_auth' });

  const tabs = [
    {
      label: 'All',
      value: 'all',
      title: 'Symbols',
      description: 'View and manage symbols in your organization.',
    },
  ];

  const actions = (memberRole === MemberRole.Owner || user.role === UserRole.Admin) && (
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
