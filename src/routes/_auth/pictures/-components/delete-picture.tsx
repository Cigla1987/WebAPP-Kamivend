import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/client/components/ui/dialog';
import { Button } from '#/client/components/ui/button';
import { deletePictureFn } from '../-pictures.functions';

type DeletePictureProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pictureId: string;
  pictureName: string;
};

const DeletePicture = ({
  isOpen,
  onOpenChange,
  pictureId,
  pictureName,
}: DeletePictureProps) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePictureFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pictures'],
      });
      toast.success(`Picture ${pictureName} deleted successfully!`);
      onOpenChange(false);
      setLoading(false);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to delete picture';
      toast.error(message);
      setLoading(false);
    },
  });

  const handleDelete = () => {
    setLoading(true);
    mutation.mutate({
      data: {
        pictureId,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Picture</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{pictureName}&quot;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePicture;
