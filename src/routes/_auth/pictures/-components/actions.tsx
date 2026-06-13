import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/client/components/ui/dropdown-menu';
import { Button } from '#/client/components/ui/button';
import DeletePicture from './delete-picture';

const Actions = ({
  pictureId,
  pictureName,
}: {
  pictureId: string;
  pictureName: string;
}) => {
  const [isDeletePictureOpen, setIsDeletePictureOpen] = useState(false);

  const handleDeletePicture = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDeletePictureOpen(true);
  };

  return (
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
        <DropdownMenuItem variant="destructive" onClick={handleDeletePicture}>
          Delete picture
        </DropdownMenuItem>
      </DropdownMenuContent>
      <DeletePicture
        isOpen={isDeletePictureOpen}
        onOpenChange={setIsDeletePictureOpen}
        pictureId={pictureId}
        pictureName={pictureName}
      />
    </DropdownMenu>
  );
};

export default Actions;
