import { MoreHorizontal } from 'lucide-react';
import { MachineType, MemberRole } from '@vending/domain';
import type { MachineDto } from '../-machines.server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@vending/ui';
import { Button } from '@vending/ui';
import { Link, useRouteContext } from '@tanstack/react-router';
import { useState } from 'react';
import UpdateMachineMode from './update-machine-mode';

const Actions = ({ machine }: { machine: MachineDto }) => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const { memberRole } = useRouteContext({ from: '/_auth' });

  const handleUpdate = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUpdateOpen(true);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {machine.machineTypeName === MachineType.Lockbox && (
            <Link
              to="/machines/$machineId/compartments"
              params={{ machineId: machine.id.toString() }}
            >
              <DropdownMenuItem>View compartments</DropdownMenuItem>
            </Link>
          )}

          {machine.machineTypeName === MachineType.Smartfridge && (
            <Link
              to="/machines/$machineId/smartfridge"
              params={{ machineId: machine.id.toString() }}
            >
              <DropdownMenuItem>View SmartFridge</DropdownMenuItem>
            </Link>
          )}

          {memberRole === MemberRole.Owner && (
            <DropdownMenuItem onClick={handleUpdate}>
              Update machine mode
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateMachineMode
        isOpen={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        machine={machine}
      />
    </>
  );
};

export default Actions;
