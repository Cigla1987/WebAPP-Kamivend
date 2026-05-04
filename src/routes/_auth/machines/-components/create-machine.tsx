import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
import { Button } from '#/client/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/client/components/ui/dialog';
import {
  FieldGroup,
  FieldLabel,
  FieldError,
} from '#/client/components/ui/field';
import { Input } from '#/client/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/client/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMachineModesFn,
  getMachineTypesFn,
  createMachineFn,
} from '../-machines.functions';
import type { MachineModeDto, MachineTypeDto } from '../-machines.server';

const createMachineSchema = z.object({
  machineName: z.string().min(1, 'Machine name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  productionYear: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  machineModeId: z.coerce.number().int().positive('Machine mode is required'),
  machineTypeId: z.coerce.number().int().positive('Machine type is required'),
  compartmentCount: z.coerce.number().int().min(1),
});

const AddMachine = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: modes, isLoading: isModesLoading } = useQuery<MachineModeDto[]>(
    {
      queryKey: ['machineModes'],
      queryFn: () => getMachineModesFn(),
      enabled: isDialogOpen,
    }
  );

  const { data: types, isLoading: isTypesLoading } = useQuery<MachineTypeDto[]>(
    {
      queryKey: ['machineTypes'],
      queryFn: () => getMachineTypesFn(),
      enabled: isDialogOpen,
    }
  );

  const { Field, handleSubmit, state, setFieldValue } = useForm({
    defaultValues: {
      machineName: 'Vend01',
      serialNumber: '240001',
      productionYear: new Date().getFullYear(),
      machineModeId: 1,
      machineTypeId: 1,
      compartmentCount: 5,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = createMachineSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues.map(
            (issue: { message: string }) => issue.message
          );
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        await createMachineFn({
          data: {
            machineName: value.machineName,
            serialNumber: value.serialNumber,
            productionYear: value.productionYear,
            machineModeId: value.machineModeId,
            machineTypeId: value.machineTypeId,
            compartmentCount:
              value.machineTypeId === 1 ? value.compartmentCount : 5,
          },
        });

        await queryClient.invalidateQueries({
          queryKey: ['machines'],
        });

        setIsDialogOpen(false);
        toast.success('Machine created successfully');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to create machine';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

  const machineTypeId = state.values.machineTypeId;

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
              Add machine
            </span>
          </Button>
        }
      ></DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader
          className={`transition-all duration-300 ${loading ? 'blur-sm' : ''}`}
        >
          <DialogTitle>Add machine</DialogTitle>
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
                  name="machineName"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel htmlFor={field.name}>Machine name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </div>
                  )}
                />

                <Field
                  name="serialNumber"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel htmlFor={field.name}>
                        Serial number
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </div>
                  )}
                />

                <Field
                  name="productionYear"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel htmlFor={field.name}>
                        Production year
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

                <div className="flex flex-col space-y-1.5">
                  <FieldLabel>Machine mode</FieldLabel>
                  <Select
                    disabled={isModesLoading}
                    value={state.values.machineModeId.toString()}
                    onValueChange={(value) =>
                      setFieldValue('machineModeId', Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {modes?.map((mode) => (
                        <SelectItem key={mode.id} value={mode.id.toString()}>
                          {mode.machineModeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <FieldLabel>Machine type</FieldLabel>
                  <Select
                    disabled={isTypesLoading}
                    value={state.values.machineTypeId.toString()}
                    onValueChange={(value) =>
                      setFieldValue('machineTypeId', Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.machineTypeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {machineTypeId !== 2 && (
                  <Field
                    name="compartmentCount"
                    children={(field) => (
                      <div className="flex flex-col space-y-1.5">
                        <FieldLabel htmlFor={field.name}>
                          Compartment count
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
                )}
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

export default AddMachine;
