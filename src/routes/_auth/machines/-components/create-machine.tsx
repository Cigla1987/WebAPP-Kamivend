import { Suspense, useState } from 'react';
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
  Field as FieldWrapper,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '#/client/components/ui/field';
import { Input } from '#/client/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/client/components/ui/select';
import { Skeleton } from '#/client/components/ui/skeleton';
import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';
import { createMachineFn } from '../-machines.functions';
import {
  machineModesQueryOptions,
  machineTypesQueryOptions,
} from '../-machines.queries';
import { MachineType } from '#/shared/enums';

const createMachineSchema = z.object({
  machineName: z.string().min(1, 'Machine name is required'),
  serialNumber: z.string().length(6, 'Serial number must be 6 digits'),
  productionYear: z
    .int('Production year is required.')
    .min(1900)
    .max(new Date().getFullYear() + 1),
  machineModeId: z.uuid('Machine mode is required'),
  machineTypeId: z.uuid('Machine type is required'),
  compartmentCount: z.int('Compartment count is required.').min(1),
});

const FormSkeletons = () => (
  <>
    <DialogHeader className="">
      <Skeleton className="h-6 w-32" />
    </DialogHeader>
    <FieldGroup className="grid w-full items-center gap-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
      </div>
    </FieldGroup>
    <DialogFooter className=" ">
      <Skeleton className="h-9 w-16" />
    </DialogFooter>
  </>
);

const FormContent = ({
  setIsDialogOpen,
}: {
  setIsDialogOpen: (v: boolean) => void;
}) => {
  const queryClient = useQueryClient();

  const { data: modes } = useSuspenseQuery(machineModesQueryOptions());
  const { data: types } = useSuspenseQuery(machineTypesQueryOptions());

  const modeItems = modes.map((mode) => ({
    label: mode.machineModeName,
    value: mode.id.toString(),
  }));

  const typeItems = types.map((type) => ({
    label: type.machineTypeName,
    value: type.id.toString(),
  }));

  const { Field, handleSubmit, state, Subscribe } = useForm({
    defaultValues: {
      machineName: 'Vend01',
      serialNumber: '240001',
      productionYear: new Date().getFullYear(),
      machineModeId: '',
      machineTypeId: '',
      compartmentCount: 5,
    },
    validators: {
      onSubmit: createMachineSchema,
    },
    onSubmit: async ({ value }) => {
      const selectedType = types.find((t) => t.id === value.machineTypeId);
      mutation.mutate({
        data: {
          machineName: value.machineName,
          serialNumber: value.serialNumber,
          productionYear: value.productionYear,
          machineModeId: value.machineModeId,
          machineTypeId: value.machineTypeId,
          compartmentCount:
            selectedType?.machineTypeName === MachineType.Lockbox
              ? value.compartmentCount
              : 5,
        },
      });
    },
  });

  const mutation = useMutation({
    mutationFn: createMachineFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['machines'],
      });
      setIsDialogOpen(false);
      toast.success('Machine created successfully');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to create machine';
      toast.error(message);
    },
  });

  return (
    <>
      <DialogHeader
        className={`transition-all duration-300 ${mutation.isPending ? 'blur-sm' : ''}`}
      >
        <DialogTitle>Create machine</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
      >
        <div className="relative">
          <div
            className={`grid w-full items-center gap-4 transition-all duration-300 ${mutation.isPending ? 'blur-sm' : ''}`}
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
                      aria-invalid={field.state.meta.errors.length > 0}
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
                    <FieldLabel htmlFor={field.name}>Serial number</FieldLabel>
                    <Input
                      type="number"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={field.state.meta.errors.length > 0}
                      required
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
                      aria-invalid={field.state.meta.errors.length > 0}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                )}
              />

              <Field
                name="machineModeId"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>Machine mode</FieldLabel>
                    <Select
                      items={modeItems}
                      value={field.state.value ?? ''}
                      onValueChange={(value) =>
                        value && field.handleChange(value)
                      }
                    >
                      <SelectTrigger
                        aria-invalid={field.state.meta.errors.length > 0}
                      >
                        <SelectValue placeholder="Select machine mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {modes.map((mode) => (
                            <SelectItem key={mode.id} value={mode.id}>
                              {mode.machineModeName}
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

              <Field
                name="machineTypeId"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>Machine type</FieldLabel>
                    <Select
                      items={typeItems}
                      value={field.state.value ?? ''}
                      onValueChange={(value) =>
                        value && field.handleChange(value)
                      }
                    >
                      <SelectTrigger
                        aria-invalid={field.state.meta.errors.length > 0}
                      >
                        <SelectValue placeholder="Select machine type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {types.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.machineTypeName}
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
              <Subscribe
                selector={(state) => {
                  const selectedType = types.find(
                    (t) => t.id === state.values.machineTypeId
                  );
                  return selectedType?.machineTypeName === MachineType.Lockbox;
                }}
                children={(showCompartmentCount) =>
                  showCompartmentCount && (
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
                            aria-invalid={field.state.meta.errors.length > 0}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </div>
                      )}
                    />
                  )
                }
              />
            </FieldGroup>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            disabled={!state.canSubmit || mutation.isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

const CreateMachineSuspense = () => {
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
              Add machine
            </span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-106.25">
        <Suspense fallback={<FormSkeletons />}>
          <FormContent setIsDialogOpen={setIsDialogOpen} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMachineSuspense;
