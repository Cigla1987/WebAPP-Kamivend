import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@vending/ui';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@vending/ui';
import {
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@vending/ui';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@vending/ui';
import { updateProductDiscountFn } from '../-products.functions';
import type { ProductDto } from '../-products.server';

const updateProductDiscountSchema = z.object({
  defaultPrice: z
    .number('Default price must be a number')
    .min(0, 'Default price must be at least 0'),
  discountValue: z
    .number('Discount value must be a number')
    .min(0, 'Discount value must be at least 0'),
  discountDay: z
    .number('Discount day must be a number')
    .min(0, 'Discount day must be at least 0'),
});

type UpdateProductDiscountProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDto;
};

const FormContent = ({
  product,
  onOpenChange,
}: {
  product: ProductDto;
  onOpenChange: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      defaultPrice: parseFloat(product.defaultPrice) || 0,
      discountValue: product.discountValue ?? 0,
      discountDay: product.discountDay ?? 0,
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsed = updateProductDiscountSchema.safeParse(value);
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
        await updateProductDiscountFn({
          data: {
            id: product.id,
            defaultPrice: value.defaultPrice,
            discountValue: value.discountValue,
            discountDay: value.discountDay,
          },
        });

        await queryClient.invalidateQueries({
          queryKey: ['products'],
        });

        onOpenChange(false);
        toast.success('Product discount updated successfully');
      } catch (error) {
        toast.error('Failed to update product discount');
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
        <DialogTitle>Update product discount</DialogTitle>
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
                name="defaultPrice"
                children={(field) => (
                  <div className="flex flex-col space-y-1.5">
                    <FieldLabel htmlFor={field.name}>
                      Default price
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          field.handleChange(0);
                        } else {
                          const num = parseFloat(val);
                          if (!isNaN(num)) {
                            field.handleChange(num);
                          }
                        }
                      }}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                )}
              />
              <Field
                name="discountValue"
                children={(field) => (
                  <div className="flex flex-col space-y-1.5">
                    <FieldLabel htmlFor={field.name}>
                      Discount value
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          field.handleChange(0);
                        } else {
                          const num = parseFloat(val);
                          if (!isNaN(num)) {
                            field.handleChange(num);
                          }
                        }
                      }}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                )}
              />
              <Field
                name="discountDay"
                children={(field) => (
                  <div className="flex flex-col space-y-1.5">
                    <FieldLabel htmlFor={field.name}>Discount day</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          field.handleChange(0);
                        } else {
                          const num = parseFloat(val);
                          if (!isNaN(num)) {
                            field.handleChange(num);
                          }
                        }
                      }}
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                )}
              />
            </FieldGroup>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button type="submit" disabled={!state.canSubmit || loading}>
            {loading ? 'Updating...' : 'Update discount'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

const UpdateProductDiscount: React.FC<UpdateProductDiscountProps> = ({
  isOpen,
  onOpenChange,
  product,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <FormContent product={product} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProductDiscount;
