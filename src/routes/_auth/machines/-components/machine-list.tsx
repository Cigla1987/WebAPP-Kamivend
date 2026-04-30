import { type FC } from 'react';
import TabbedList from '#/client/components/custom/tabbed-list';
import authClient from '#/client/lib/auth-client';
import { getColumns } from './columns';
import { capitalizeFirstLetter } from '#/client/lib/utils';
import type {
  MachineWithTypeName,
  MachineType,
} from '#/shared/schemas/machines';

interface MachinesListProps {
  machines: MachineWithTypeName[];
  machineTypes: MachineType[];
}

const AddMachine = () => <button>Add Machine</button>;
const AssignMachine = () => <button>Assign Machine</button>;

const MachinesList: FC<MachinesListProps> = ({ machines, machineTypes }) => {
  const userRole = authClient.useSession().data?.user.role;

  const tabs = [
    {
      label: 'All',
      value: 'all',
    },
    ...machineTypes.map((machineType) => ({
      label: capitalizeFirstLetter(machineType.machineTypeName),
      value: machineType.machineTypeName,
      filterFn: (data: MachineWithTypeName[]) =>
        data.filter((m) => m.machineTypeName === machineType.machineTypeName),
    })),
  ];

  const actions = userRole === 'superadmin' && (
    <>
      <AddMachine />
      <AssignMachine />
    </>
  );

  const columnsFunction = (filteredData: MachineWithTypeName[]) => {
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
