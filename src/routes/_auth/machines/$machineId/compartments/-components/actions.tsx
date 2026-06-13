import { MoreHorizontal } from 'lucide-react';
import { MachineMode, UserRole } from '#/shared/enums';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/client/components/ui/dropdown-menu';
import { Button } from '#/client/components/ui/button';
import { useState } from 'react';
import authClient from '#/client/lib/auth-client';
import UpdateDiscount from './update-discount';
import UpdateManagedBy from './update-managed-by';
import UpdatePrice from './update-price';
import type { CompartmentDto } from '../-compartments.server';

const Actions = ({ compartment }: { compartment: CompartmentDto }) => {
  const isMulti = compartment.machineModeName === MachineMode.Multi;
  const hasProduct = compartment.productId !== null;
  const [isUpdateDiscountOpen, setIsUpdateDiscountOpen] = useState(false);
  const [isUpdatePriceOpen, setIsUpdatePriceOpen] = useState(false);
  const [isUpdateManagedByOpen, setIsUpdateManagedByOpen] = useState(false);
  const role = authClient.useSession().data?.user.role;

  const hasActions = () => {
    if (role === UserRole.Superadmin) return true;
    if (role === UserRole.Owner) return hasProduct || isMulti;
    if (role === UserRole.Employee) return hasProduct;
    return false;
  };

  const handleUpdateDiscount = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUpdateDiscountOpen(true);
  };

  const handleUpdatePrice = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUpdatePriceOpen(true);
  };

  const handleUpdateManagedBy = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUpdateManagedByOpen(true);
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
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!hasActions() && (
            <DropdownMenuItem disabled className="text-muted-foreground">
              No actions
            </DropdownMenuItem>
          )}

          {/* Admin actions */}
        {role === UserRole.Superadmin && (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No actions
          </DropdownMenuItem>
        )}

        {/* Owner actions */}
        {hasProduct && role === UserRole.Owner && (
            <DropdownMenuItem onClick={handleUpdateDiscount}>
              Update discount
            </DropdownMenuItem>
          )}
        {hasProduct && (role === UserRole.Owner || role === UserRole.Employee) && (
            <DropdownMenuItem onClick={handleUpdatePrice}>
              Update price
            </DropdownMenuItem>
          )}
        {isMulti && role === UserRole.Owner && (
            <DropdownMenuItem onClick={handleUpdateManagedBy}>
              Update managed by
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateDiscount
        isOpen={isUpdateDiscountOpen}
        onOpenChange={setIsUpdateDiscountOpen}
        compartment={compartment}
      />
      <UpdatePrice
        isOpen={isUpdatePriceOpen}
        onOpenChange={setIsUpdatePriceOpen}
        compartment={compartment}
      />
      <UpdateManagedBy
        isOpen={isUpdateManagedByOpen}
        onOpenChange={setIsUpdateManagedByOpen}
        compartment={compartment}
      />
    </>
  );
};
export default Actions;
