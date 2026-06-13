import { type FC } from 'react';
import TabbedList from '#/client/components/custom/tabbed-list';
import { getColumns } from './columns';
import { capitalizeFirstLetter } from '#/client/lib/utils';
import type { MachineDto, MachineTypeDto } from '../-machines.server';
import { useRouteContext } from '@tanstack/react-router';
import CreateMachine from './create-machine';
import AssignMachine from './assign-machine';

interface MachinesListProps {
  machines: MachineDto[];
  machineTypes: MachineTypeDto[];
}

const MachinesList: FC<MachinesListProps> = ({ machines, machineTypes }) => {
  const { user } = useRouteContext({ from: '/_auth' });
  const userRole = user.role;

  const tabs = [
    {
      label: 'All',
      value: 'all',
    },
    ...machineTypes.map((machineType) => ({
      label: capitalizeFirstLetter(machineType.machineTypeName),
      value: machineType.machineTypeName,
      filterFn: (data: MachineDto[]) =>
        data.filter((m) => m.machineTypeName === machineType.machineTypeName),
    })),
  ];

  const actions = userRole === 'superadmin' && (
    <>
      <CreateMachine />
      <AssignMachine />
    </>
  );

  const columnsFunction = (filteredData: MachineDto[]) => {
    return getColumns(filteredData, userRole!);
  };

  return (
    <TabbedList
      data={machines}
      tabs={tabs}
      columns={columnsFunction}
      actions={actions}
    />
  );
};

export default MachinesList;
