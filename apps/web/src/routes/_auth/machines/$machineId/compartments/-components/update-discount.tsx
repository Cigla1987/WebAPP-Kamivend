import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod/v4';
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
import { useParams } from '@tanstack/react-router';
import { Input } from '@vending/ui';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@vending/ui';
import { cn } from '@vending/ui/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@vending/ui';
import { updateDiscount } from '../-compartments.functions';
import type { CompartmentDto } from '../-compartments.server';

const updateDiscountSchema = z.object({
  discountValue: z.coerce
    .number<number>('Discount value needs to be a number!')
    .positive("Discount value can't be less than 0!"),
  discountDay: z.coerce
    .number<number>('Discount day needs to be greater than 0!')
    .positive("Discount day can't be less than 0!"),
  expirationDate: z.date('Please select expiration date!'),
});

type UpdateDiscountProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  compartment: CompartmentDto;
};

const UpdateDiscount: React.FC<UpdateDiscountProps> = ({
  isOpen,
  onOpenChange,
  compartment,
}) => {
  const [loading, setLoading] = useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const { machineId } = useParams({
    from: '/_auth/machines/$machineId/compartments/',
  });
  const queryClient = useQueryClient();

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      discountValue: compartment.discountValue || 0,
      discountDay: compartment.discountDay || 0,
      expirationDate: compartment.expirationDate
        ? new Date(compartment.expirationDate)
        : new Date(),
    },
    validators: {
      onSubmit: updateDiscountSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        await updateDiscount({
          data: {
            id: compartment.id,
            discountValue: value.discountValue,
            discountDay: value.discountDay,
            expirationDate: value.expirationDate.toISOString().split('T')[0],
          },
        });

        // Invalidate and refetch
        await queryClient.invalidateQueries({
          queryKey: ['compartments', 'byMachine', machineId],
        });

        onOpenChange(false);
      } catch (error) {
        toast.error('Failed to update discount!');
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
          <DialogTitle>Update discount</DialogTitle>
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
                  name="expirationDate"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel>Expiration day</FieldLabel>
                      <Popover
                        open={isDatePopoverOpen}
                        onOpenChange={setIsDatePopoverOpen}
                      >
                        <PopoverTrigger
                          render={
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.state.value && 'text-muted-foreground'
                              )}
                            >
                              {field.state.value ? (
                                format(field.state.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          }
                        />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.state.value}
                            onSelect={(date) => {
                              field.handleChange(date || new Date());
                              setIsDatePopoverOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
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
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default UpdateDiscount;
