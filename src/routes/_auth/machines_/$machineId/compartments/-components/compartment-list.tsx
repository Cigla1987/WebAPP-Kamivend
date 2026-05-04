import TabbedList from '#/client/components/custom/tabbed-list';
import type { ColumnDef } from '@tanstack/react-table';
import type { CompartmentDto } from '../-compartments.server';

interface CompartmentsListProps {
  compartments: CompartmentDto[];
  tableColumns: ColumnDef<CompartmentDto>[];
}

const CompartmentsList: React.FC<CompartmentsListProps> = ({
  compartments,
  tableColumns,
}) => {
  const tabs = [
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'In use',
      value: 'inUse',
      filterFn: (data: CompartmentDto[]) =>
        data.filter((c) => c.productName !== null),
    },
    {
      label: 'Empty',
      value: 'empty',
      filterFn: (data: CompartmentDto[]) =>
        data.filter((c) => c.productName == null),
    },
  ];

  return <TabbedList data={compartments} tabs={tabs} columns={tableColumns} />;
};

export default CompartmentsList;
