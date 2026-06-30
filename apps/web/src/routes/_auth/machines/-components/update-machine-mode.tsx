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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vending/ui';
import { updateMachineModeFn } from '../-machines.functions';
import { machineModesQueryOptions } from '../-machines.queries';
import type { MachineDto } from '../-machines.server';
import type { MachineModeDto } from '../-machines.server';

const updateMachineModeSchema = z.object({
  machineModeId: z.uuid('Machine mode is required'),
});

type UpdateMachineModeProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  machine: MachineDto;
};

const UpdateMachineMode: React.FC<UpdateMachineModeProps> = ({
  isOpen,
  onOpenChange,
  machine,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    data: modes,
    isLoading: isModesLoading,
    isError: isModesError,
  } = useQuery(machineModesQueryOptions());

  const modeItems =
    modes?.map((mode) => ({
      label: mode.machineModeName,
      value: mode.id.toString(),
    })) ?? [];

  const queryClient = useQueryClient();

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      machineModeId: machine.machineModeId ?? '',
    },
    validators: {
      onSubmit: updateMachineModeSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        await updateMachineModeFn({
          data: {
            machineId: machine.id,
            machineModeId: value.machineModeId,
          },
        });

        await queryClient.invalidateQueries({
          queryKey: ['machines'],
        });

        onOpenChange(false);
        toast.success('Machine mode updated successfully');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update machine mode';
        toast.error(message);
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
          <DialogTitle>Update machine mode</DialogTitle>
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
                  name="machineModeId"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel>Select machine mode</FieldLabel>
                      <Select
                        items={modeItems}
                        value={field.state.value ?? ''}
                        onValueChange={(value) =>
                          value && field.handleChange(value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select machine mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {!isModesLoading &&
                            !isModesError &&
                            modes?.map((mode: MachineModeDto) => (
                              <SelectItem key={mode.id} value={mode.id}>
                                {mode.machineModeName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
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

export default UpdateMachineMode;
