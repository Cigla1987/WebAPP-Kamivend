import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from '@vending/ui';
import { claimMachineFn } from '../-machines.functions';

const claimMachineSchema = z.object({
  serialNumber: z.string().length(6, 'Serial number must be 6 digits'),
  activationCode: z
    .string()
    .min(12, 'Enter the activation code supplied with the machine'),
});

export default function ClaimMachine() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: claimMachineFn,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['machines'] });
      toast.success(`Machine "${result.machineName}" added to your organization`);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to claim machine'
      );
    },
  });

  const form = useForm({
    defaultValues: {
      serialNumber: '',
      activationCode: '',
    },
    validators: {
      onSubmit: claimMachineSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({ data: value });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="gap-1">
            <KeyRound className="h-3.5 w-3.5" />
            <span>Claim machine</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Claim purchased machine</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="grid gap-4">
            <form.Field
              name="serialNumber"
              children={(field) => (
                <div className="grid gap-1.5">
                  <FieldLabel htmlFor={field.name}>Serial number</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    inputMode="numeric"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </div>
              )}
            />
            <form.Field
              name="activationCode"
              children={(field) => (
                <div className="grid gap-1.5">
                  <FieldLabel htmlFor={field.name}>Activation code</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoCapitalize="characters"
                    autoComplete="off"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </div>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Claiming...' : 'Claim machine'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
