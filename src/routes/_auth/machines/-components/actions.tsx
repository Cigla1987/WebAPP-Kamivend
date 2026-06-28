import { MoreHorizontal } from 'lucide-react';
import { MachineType, MemberRole } from '#/shared/enums';
import type { MachineDto } from '../-machines.server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/client/components/ui/dropdown-menu';
import { Button } from '#/client/components/ui/button';
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
        {machine.machineTypeName === MachineType.Lockbox && (
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          ></DropdownMenuTrigger>
        )}
        <DropdownMenuContent align="end">
          <Link
            to="/machines/$machineId/compartments"
            params={{ machineId: machine.id.toString() }}
          >
            <DropdownMenuItem>View compartments</DropdownMenuItem>
          </Link>

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
