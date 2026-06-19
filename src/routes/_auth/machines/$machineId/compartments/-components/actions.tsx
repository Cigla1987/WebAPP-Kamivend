import { MoreHorizontal } from 'lucide-react';
import { MachineMode, UserRole, MemberRole } from '#/shared/enums';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/client/components/ui/dropdown-menu';
import { Button } from '#/client/components/ui/button';
import { useState } from 'react';
import { useRouteContext } from '@tanstack/react-router';
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
  const { user, memberRole } = useRouteContext({ from: '/_auth' });
  const isOwner = memberRole === MemberRole.Owner || user.role === UserRole.Admin;

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

  const hasActions = () => {
    if (user.role === UserRole.Admin) return true;
    if (isOwner) return hasProduct || isMulti;
    return hasProduct;
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

          {user.role === UserRole.Admin && (
            <DropdownMenuItem disabled className="text-muted-foreground">
              No actions
            </DropdownMenuItem>
          )}

          {hasProduct && isOwner && (
            <DropdownMenuItem onClick={handleUpdateDiscount}>
              Update discount
            </DropdownMenuItem>
          )}
          {hasProduct && (
            <DropdownMenuItem onClick={handleUpdatePrice}>
              Update price
            </DropdownMenuItem>
          )}
          {isMulti && isOwner && (
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
