import { MoreHorizontal } from 'lucide-react';

import type { MachineDto } from '../-machines.server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/client/components/ui/dropdown-menu';
import { Button } from '#/client/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import authClient from '#/client/lib/auth-client';
// import UpdateMachineMode from './update-machine-mode';

const Actions = ({ machine }: { machine: MachineDto }) => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const role = authClient.useSession().data?.user.role;

  const handleUpdate = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUpdateOpen(true);
  };

  return (
    <DropdownMenu modal={false}>
      {machine.machineTypeName === 'lockbox' && (
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
        {/* Available to all authenticated users */}
        {/* <Link */}
        {/*   to="/machines/$machineId/compartments" */}
        {/*   params={{ machineId: machine.id.toString() }} */}
        {/* > */}
        {/*   <DropdownMenuItem>View compartments</DropdownMenuItem> */}
        {/* </Link> */}

        {/* Owner-only actions */}
        {role === 'owner' && (
          <>
            <DropdownMenuItem onClick={handleUpdate}>
              Update machine mode
            </DropdownMenuItem>
            {/* <UpdateMachineMode */}
            {/*   isOpen={isUpdateOpen} */}
            {/*   onOpenChange={setIsUpdateOpen} */}
            {/*   machineId={machine.id} */}
            {/* /> */}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Actions;
