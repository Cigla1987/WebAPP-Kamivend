import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { isOwner as checkIsOwner } from '#/utils/permissions';
import { UserRole } from '@vending/domain';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@vending/ui';
import { Button } from '@vending/ui';
import { useRouteContext } from '@tanstack/react-router';
import UpdateProductDiscount from './update-product-discount';
import AssignProductPicture from './assign-product-picture';
import type { ProductDto } from '../-products.server';

const Actions = ({ product }: { product: ProductDto }) => {
  const [isUpdateDiscountOpen, setIsUpdateDiscountOpen] = useState(false);
  const [isAssignPictureOpen, setIsAssignPictureOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, memberRole } = useRouteContext({ from: '/_auth' });
  const isOwner = checkIsOwner(memberRole) || user.role === UserRole.Admin;

  const handleUpdateDiscount = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setIsUpdateDiscountOpen(true);
  };

  const handleAssignPicture = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    setIsAssignPictureOpen(true);
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen} modal={false}>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isOwner && (
            <DropdownMenuItem closeOnClick={false} onClick={handleUpdateDiscount}>
              Update discount
            </DropdownMenuItem>
          )}
          <DropdownMenuItem closeOnClick={false} onClick={handleAssignPicture}>
            Assign picture
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isOwner && (
        <UpdateProductDiscount
          isOpen={isUpdateDiscountOpen}
          onOpenChange={setIsUpdateDiscountOpen}
          product={product}
        />
      )}
      <AssignProductPicture
        isOpen={isAssignPictureOpen}
        onOpenChange={setIsAssignPictureOpen}
        product={product}
      />
    </>
  );
};

export default Actions;
