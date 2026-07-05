import { Suspense, useState } from 'react';
import { useForm, useStore } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { PlusCircle } from 'lucide-react';
import { Button } from '@vending/ui';
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vending/ui';
import { Skeleton } from '@vending/ui';
import { Spinner } from '@vending/ui';
import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { assignMachineFn } from '../-machines.functions';
import {
  ownersQueryOptions,
  organizationsByOwnerQueryOptions,
} from '../-users.queries';
import { machinesQueryOptions } from '../-machines.queries';

const assignMachineSchema = z.object({
  serialNumber: z
    .string()
    .length(6, { message: 'Machine must be selected' })
    .trim(),
  userId: z.string().min(1, { message: 'Owner must be selected' }),
  organizationId: z.string().min(1, { message: 'Organization must be selected' }),
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
      <FieldWrapper>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-20" />
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

  const machineItems = machines.map((machine) => ({
    label: `${machine.machineName} (${machine.serialNumber})`,
    value: machine.serialNumber,
  }));

  const form = useForm({
    defaultValues: {
      serialNumber: '',
      userId: '',
      organizationId: '',
    },
    validators: {
      onSubmit: assignMachineSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        data: {
          serialNumber: value.serialNumber,
          userId: value.userId,
          organizationId: value.organizationId,
        },
      });
    },
  });

  const userId = useStore(form.store, (state) => state.values.userId);
  const canSubmit = useStore(form.store, (state) => state.canSubmit);

  const orgQuery = useQuery({
    ...organizationsByOwnerQueryOptions(userId),
    enabled: !!userId,
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
          form.handleSubmit();
        }}
      >
        <div className="relative">
          <div
            className={`grid w-full items-center gap-4 transition-all duration-300`}
          >
            <FieldGroup className="grid w-full items-center gap-4">
              <form.Field
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
              <form.Field
                name="userId"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>Owner</FieldLabel>
                    <Select
                      items={owners.map((owner) => ({
                        label: owner.name,
                        value: owner.id,
                      }))}
                      value={field.state.value}
                      onValueChange={(value) => {
                        field.handleChange(value ?? '');
                        form.setFieldValue('organizationId', '');
                      }}
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
              <form.Field
                name="organizationId"
                children={(field) => (
                  <FieldWrapper>
                    <FieldLabel htmlFor={field.name}>Organization</FieldLabel>
                    <Select
                      items={orgQuery.data?.map((org) => ({
                        label: org.name,
                        value: org.id,
                      })) ?? []}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                      disabled={!userId || orgQuery.isLoading}
                    >
                      <SelectTrigger
                        aria-invalid={field.state.meta.errors.length > 0}
                      >
                        {orgQuery.isLoading ? (
                          <span className="flex items-center gap-2">
                            <Spinner className="size-4" />
                            Loading...
                          </span>
                        ) : (
                          <SelectValue placeholder="Select an organization" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {orgQuery.data?.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
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
            disabled={!canSubmit || mutation.isPending}
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
