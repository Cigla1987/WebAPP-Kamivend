import { Suspense, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '#/client/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/client/components/ui/dialog';
import {
  Field as FieldWrapper,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '#/client/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/client/components/ui/select';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { updateProductPictureFn } from '../-products.functions';
import { picturesQueryOptions } from '../../pictures/-pictures.queries';
import type { ProductDto } from '../-products.server';
import { Skeleton } from '#/client/components/ui/skeleton';

const updateProductPictureSchema = z.object({
  productPictureId: z.uuid('Picture is required'),
});

type AssignProductPictureProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDto;
};

const FormSkeletons = () => (
  <>
    <DialogHeader>
      <Skeleton className="h-6 w-32" />
    </DialogHeader>
    <FieldGroup className="grid w-full items-center gap-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
    </FieldGroup>
    <DialogFooter>
      <Skeleton className="h-9 w-16" />
    </DialogFooter>
  </>
);

const FormContent = ({
  product,
  onOpenChange,
}: {
  product: ProductDto;
  onOpenChange: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: pictures } = useSuspenseQuery(picturesQueryOptions());

  const pictureItems = pictures.map((picture) => ({
    label: picture.pictureName || 'Unnamed Picture',
    value: picture.id,
  }));

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      productPictureId: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsed = updateProductPictureSchema.safeParse({
          productPictureId: value.productPictureId,
        });
        if (!parsed.success) {
          const fieldErrors: Record<string, { message: string }[]> = {};
          for (const issue of parsed.error.issues) {
            const path = issue.path.join('.');
            if (!fieldErrors[path]) fieldErrors[path] = [];
            fieldErrors[path].push({ message: issue.message });
          }
          return { fields: fieldErrors };
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        await updateProductPictureFn({
          data: {
            id: product.id,
            productPictureId: value.productPictureId,
          },
        });

        await queryClient.invalidateQueries({
          queryKey: ['products'],
        });

        onOpenChange(false);
        toast.success('Product picture updated successfully');
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to update product picture';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <DialogHeader
        className={`transition-all duration-300 ${loading ? 'blur-sm' : ''}`}
      >
        <DialogTitle>Assign picture</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <div className="relative">
          {loading && (
            <div className="absolute inset-x-0 top-1/4">
              <div className="flex items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
              </div>
            </div>
          )}
          <div
            className={`grid w-full items-center gap-4 transition-all duration-300 ${
              loading ? 'blur-sm' : ''
            }`}
          >
            <FieldGroup className="grid w-full items-center gap-4">
              <Field
                name="productPictureId"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>Picture</FieldLabel>
                    <Select
                      items={pictureItems}
                      value={field.state.value}
                      onValueChange={(value) =>
                        value && field.handleChange(value)
                      }
                    >
                      <SelectTrigger
                        aria-invalid={field.state.meta.errors.length > 0}
                      >
                        <SelectValue placeholder="Select picture"></SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {pictures.map((picture) => (
                            <SelectItem key={picture.id} value={picture.id}>
                              <div className="flex items-center gap-2">
                                {picture.pictureContent && (
                                  <img
                                    src={picture.pictureContent}
                                    alt={picture.pictureName || 'Picture'}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                )}
                                <span>
                                  {picture.pictureName || 'Unnamed Picture'}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </FieldWrapper>
                )}
              />
            </FieldGroup>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button type="submit" disabled={!state.canSubmit || loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

const AssignProductPicture: React.FC<AssignProductPictureProps> = ({
  isOpen,
  onOpenChange,
  product,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <Suspense fallback={<FormSkeletons />}>
          <FormContent product={product} onOpenChange={onOpenChange} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};

export default AssignProductPicture;
