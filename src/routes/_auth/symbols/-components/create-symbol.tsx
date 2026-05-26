import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
import { Button } from '#/client/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/client/components/ui/dialog';
import {
  Field as FieldWrapper,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '#/client/components/ui/field';
import { Input } from '#/client/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSymbolFn } from '../-symbols.functions';
import { convertToBase64 } from '#/client/lib/utils';

const createSymbolSchema = z.object({
  symbolName: z
    .string()
    .min(1, 'Symbol name is required')
    .max(50, 'Symbol name must be 50 characters or less'),
  symbolPicture: z.string().min(1, 'A picture is required.'),
});

const FormContent = ({
  setIsDialogOpen,
}: {
  setIsDialogOpen: (v: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const [fileName, setFileName] = useState<string>('');

  const mutation = useMutation({
    mutationFn: createSymbolFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['symbols'],
      });
      setIsDialogOpen(false);
      toast.success(`Symbol ${fileName} created successfully`);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to create symbol';
      toast.error(message);
    },
  });

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      symbolName: '',
      symbolPicture: '',
    },
    validators: {
      onSubmit: createSymbolSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        data: {
          symbolName: value.symbolName,
          symbolPicture: value.symbolPicture,
        },
      });
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add symbol</DialogTitle>
        <DialogDescription>
          Create a new symbol with a name and picture
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
            name="symbolName"
            children={(field) => (
              <div className="flex flex-col space-y-1.5">
                <FieldLabel htmlFor={field.name}>Symbol name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter symbol name"
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </div>
            )}
          />
          <Field
            name="symbolPicture"
            children={(field) => (
              <FieldWrapper>
                <FieldLabel htmlFor="symbolPictureInput">Picture</FieldLabel>
                <Input
                  id="symbolPictureInput"
                  className="cursor-pointer"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setFileName(files[0].name);
                      try {
                        const base64 = await convertToBase64(files[0]);
                        field.handleChange(base64);
                      } catch {
                        toast.error('Failed to process image');
                      }
                    } else {
                      setFileName('');
                      field.handleChange('');
                    }
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </FieldWrapper>
            )}
          />
          {fileName && (
            <div className="text-sm text-gray-500">
              Selected file: {fileName}
            </div>
          )}
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

const CreateSymbol = () => {
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
              Add symbol
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

export default CreateSymbol;
