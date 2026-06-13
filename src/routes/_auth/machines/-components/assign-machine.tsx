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
import { assignMachineFn } from '../-machines.functions';
import { ownersQueryOptions } from '../-users.queries';
import { machinesQueryOptions } from '../-machines.queries';

const assignMachineSchema = z.object({
  serialNumber: z
    .string()
    .length(6, { message: 'Machine must be selected' })
    .trim(),
  ownerId: z.string(),

  // .nonempty('Owner must be selected.'),
});

const FormSkeletons = () => (
  <>
    <DialogHeader className="">
      <Skeleton className="h-6 w-32" />
    </DialogHeader>
    <FieldGroup className="grid w-full items-center gap-1.5">
      <FieldWrapper>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      </FieldWrapper>
      <FieldWrapper>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full" />
        </div>
      </FieldWrapper>
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

  const { data: owners } = useSuspenseQuery(ownersQueryOptions());
  const { data: machines } = useSuspenseQuery(machinesQueryOptions());

  const ownerItems = owners.map((owner) => ({
    label: owner.name,
    value: owner.id,
  }));

  const machineItems = machines.map((machine) => ({
    label: `${machine.machineName} (${machine.serialNumber})`,
    value: machine.serialNumber,
  }));

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      serialNumber: '',
      ownerId: '',
    },
    validators: {
      onSubmit: assignMachineSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        data: {
          serialNumber: value.serialNumber,
          ownerId: value.ownerId,
        },
      });
    },
  });

  const mutation = useMutation({
    mutationFn: assignMachineFn,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['machines'],
      });
      setIsDialogOpen(false);
      toast.success(`Machine "${result.machineName}" assigned successfully`);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to assign machine';
      toast.error(message);
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Assign machine</DialogTitle>
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
            className={`grid w-full items-center gap-4 transition-all duration-300`}
          >
            <FieldGroup className="grid w-full items-center gap-4">
              <Field
                name="serialNumber"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>Machine</FieldLabel>
                    <Select
                      items={machineItems}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                    >
                      <SelectTrigger
                        aria-invalid={field.state.meta.errors.length > 0}
                      >
                        <SelectValue placeholder="Select a machine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {machines.map((machine) => (
                            <SelectItem
                              key={machine.serialNumber}
                              value={machine.serialNumber}
                            >
                              {machine.machineName} ({machine.serialNumber})
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
                name="ownerId"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>Owner</FieldLabel>
                    <Select
                      items={ownerItems}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                    >
                      <SelectTrigger
                        aria-invalid={field.state.meta.errors.length > 0}
                      >
                        <SelectValue placeholder="Select an owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {owners.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
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

const AssignMachineSuspense = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="gap-1 transition-transform duration-75 active:scale-[0.97]"
          >
            <PlusCircle data-icon="inline-start" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Assign machine
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

export default AssignMachineSuspense;
