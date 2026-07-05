import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
import { Button } from '@vending/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@vending/ui';
import {
  Field as FieldWrapper,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@vending/ui';
import { Input } from '@vending/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPictureFn } from '../-pictures.functions';
import { convertToBase64 } from '#/client/lib/utils';

const createPictureSchema = z.object({
  pictureFile: z
    .file()
    .max(5 * 1024 * 1024, 'File size must be less than 5MB.')
    .mime(['image/png', 'image/jpeg'], 'Only PNG or JPEG images are accepted.'),
});

const FormContent = ({
  setIsDialogOpen,
}: {
  setIsDialogOpen: (v: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState<string>('');

  const mutation = useMutation({
    mutationFn: createPictureFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pictures'],
      });
      setIsDialogOpen(false);
      toast.success(`Picture ${fileName} created successfully`);
      setFileName('');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to create picture';
      toast.error(message);
    },
  });

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      pictureFile: undefined as File | undefined,
    },
    validators: {
      onSubmit: createPictureSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.pictureFile) {
        toast.error('Please select a picture');
        return;
      }
      try {
        const base64 = await convertToBase64(value.pictureFile);
        mutation.mutate({
          data: {
            pictureName: fileName,
            pictureContent: base64,
          },
        });
      } catch {
        toast.error('Failed to process image');
      }
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add picture</DialogTitle>
        <DialogDescription>
          Upload a new picture to your collection
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <FieldGroup className="grid w-full items-center gap-4">
          <Field
            name="pictureFile"
            children={(field) => (
              <FieldWrapper>
                <FieldLabel htmlFor="pictureFileInput">Picture</FieldLabel>
                <Input
                  id="pictureFileInput"
                  className="cursor-pointer"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setFileName(files[0].name);
                      field.handleChange(files[0]);
                    } else {
                      setFileName('');
                      field.handleChange(undefined);
                    }
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </FieldWrapper>
            )}
          />
        </FieldGroup>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            disabled={!state.canSubmit || mutation.isPending}
          >
            {mutation.isPending ? 'Creating...' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

const CreatePicture = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="gap-1 transition-transform duration-75 active:scale-[0.97]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add picture
            </span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-120">
        <FormContent setIsDialogOpen={setIsDialogOpen} />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePicture;
