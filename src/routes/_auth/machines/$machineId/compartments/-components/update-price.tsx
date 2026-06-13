import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';
import { Button } from '#/client/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/client/components/ui/dialog';
import {
  FieldGroup,
  FieldLabel,
  FieldError,
} from '#/client/components/ui/field';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Input } from '#/client/components/ui/input';
import { Checkbox } from '#/client/components/ui/checkbox';
import { updatePrice } from '../-compartments.functions';
import type { CompartmentDto } from '../-compartments.server';

const updatePriceSchema = z.object({
  newPrice: z.coerce
    .number<number>('New price needs to be a number!')
    .positive("New price can't be less than 0."),
  updateAll: z.boolean(),
});

type UpdatePriceProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  compartment: CompartmentDto;
};

const UpdatePrice: React.FC<UpdatePriceProps> = ({
  isOpen,
  onOpenChange,
  compartment,
}) => {
  const [loading, setLoading] = useState(false);
  const { machineId } = useParams({
    from: '/_auth/machines/$machineId/compartments/',
  });
  const queryClient = useQueryClient();

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      newPrice: compartment.currentPrice
        ? parseFloat(compartment.currentPrice)
        : 0,
      updateAll: false,
    },
    validators: {
      onSubmit: updatePriceSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        await updatePrice({
          data: {
            id: compartment.id,
            newPrice: value.newPrice,
            updateAll: value.updateAll,
          },
        });

        // Invalidate and refetch
        await queryClient.invalidateQueries({
          queryKey: ['compartments', 'byMachine', machineId],
        });

        onOpenChange(false);
      } catch (error) {
        toast.error('Failed to update price!');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader
          className={`transition-all duration-300 ${loading ? 'blur-sm' : ''}`}
        >
          <DialogTitle>Update price</DialogTitle>
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
              <div className="absolute inset-x-0 top-1/4">Loading..</div>
            )}
            <div
              className={`grid w-full items-center gap-4 transition-all duration-300 ${
                loading ? 'blur-sm' : ''
              }`}
            >
              <FieldGroup className="grid w-full items-center gap-4">
                <Field
                  name="newPrice"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel htmlFor={field.name}>New price</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.valueAsNumber)
                        }
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </div>
                  )}
                />
                <Field
                  name="updateAll"
                  children={(field) => (
                    <div className="flex flex-row items-start space-y-0 space-x-3">
                      <Checkbox
                        checked={field.state.value}
                        onCheckedChange={(checked) =>
                          field.handleChange(checked as boolean)
                        }
                      />
                      <FieldLabel>Update all</FieldLabel>
                    </div>
                  )}
                />
              </FieldGroup>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={!state.canSubmit || loading}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default UpdatePrice;
