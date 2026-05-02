import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '#/client/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import Actions from './actions';
import type { MachineDto } from '../-machines.server';

export const getColumns = (
  machines: MachineDto[],
  userRole?: string
): ColumnDef<MachineDto>[] => {
  // Check if there are any lockbox machines in the data
  const hasLockboxMachines = machines.some(
    (machine) => machine.machineTypeName === 'lockbox'
  );
  const columns: ColumnDef<MachineDto>[] = [
    {
      accessorKey: 'id',
      sortingFn: 'basic',
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const id: number = row.getValue('id');
        return <div className="text-center font-medium">{id}</div>;
      },
    },
    {
      accessorKey: 'machineName',
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => {
        const name: string = row.getValue('machineName');
        return <div className="text-center font-medium">{name}</div>;
      },
    },
    {
      accessorKey: 'serialNumber',
      header: () => <div className="text-center">Serial number</div>,
      cell: ({ row }) => {
        const serialNumber: string = row.getValue('serialNumber');
        return <div className="text-center font-medium">{serialNumber}</div>;
      },
    },
    {
      accessorKey: 'productionYear',
      header: () => <div className="text-center">Production year</div>,
      cell: ({ row }) => {
        const productionYear: number = row.getValue('productionYear');
        return <div className="text-center font-medium">{productionYear}</div>;
      },
    },
    {
      accessorKey: 'machineModeName',
      header: () => <div className="text-center">Machine mode</div>,
      cell: ({ row }) => {
        const machineMode: string = row.getValue('machineModeName');
        return (
          <div className="text-center font-medium capitalize">
            {machineMode}
          </div>
        );
      },
    },
    {
      accessorKey: 'machineTypeName',
      header: () => <div className="text-center">Machine type</div>,
      cell: ({ row }) => {
        const machineType: string = row.getValue('machineTypeName');
        return (
          <div className="text-center font-medium capitalize">
            {machineType}
          </div>
        );
      },
    },
  ];
  // Only add compartmentCount column if there are lockbox machines in the data
  if (hasLockboxMachines) {
    columns.push({
      accessorKey: 'compartmentCount',
      header: () => <div className="text-center">Compartment count</div>,
      cell: ({ row }) => {
        const compartmentCount: number = row.getValue('compartmentCount');
        return (
          <div className="text-center font-medium">{compartmentCount}</div>
        );
      },
    });
  }
  // Add remaining columns after compartmentCount
  columns.push({
    accessorKey: 'machineDateCreated',
    header: () => <div className="text-center">Date created</div>,
    cell: ({ row }) => {
      const dateCreated: Date = new Date(row.getValue('machineDateCreated'));
      const formattedDate = dateCreated.toLocaleDateString('hr-HR');
      return <div className="text-center font-medium">{formattedDate}</div>;
    },
  });
  // Only add ownerName column for admin users
  if (userRole === 'superadmin') {
    columns.push({
      accessorKey: 'ownerName',
      header: () => <div className="text-center">Owner</div>,
      cell: ({ row }) => {
        const ownerName: string = row.getValue('ownerName');
        const ownerNameDisplay: string = ownerName != null ? ownerName : '-';
        return (
          <div className="text-center font-medium">{ownerNameDisplay}</div>
        );
      },
    });
  }
  // Always add actions column last
  columns.push({
    id: 'actions',
    cell: ({ row }) => {
      return <Actions machine={row.original} />;
    },
  });
  return columns;
};
// Keep the hook for backward compatibility
export const useColumns = (
  machines?: MachineDto[]
): ColumnDef<MachineDto>[] => {
  return getColumns(machines || []);
};
