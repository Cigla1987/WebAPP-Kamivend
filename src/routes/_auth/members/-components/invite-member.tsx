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
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { inviteMemberFn } from '../-members.functions';

const inviteMemberSchema = z.object({
  email: z.email('Invalid email address.'),
});

const InviteMember = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const inviteMember = useMutation({
    mutationFn: inviteMemberFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['members'],
      });
      queryClient.invalidateQueries({
        queryKey: ['pending-invitations'],
      });
      setIsDialogOpen(false);
      toast.success('Invitation created successfully');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to send invitation';
      toast.error(message);
    },
  });

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsed = inviteMemberSchema.safeParse(value);
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
      inviteMember.mutate({
        data: {
          email: value.email,
        },
      });
    },
  });

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
    >
      <DialogTrigger
        render={
          <Button
            size="sm"
            className="gap-1 transition-transform duration-75 active:scale-[0.97]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Invite member
            </span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader
          className={`transition-all duration-300 ${inviteMember.isPending ? 'blur-sm' : ''}`}
        >
          <DialogTitle>Invite member</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
        >
          <div className="relative">
            {inviteMember.isPending && (
              <div className="absolute inset-x-0 top-1/4 text-center">
                Sending invitation...
              </div>
            )}
            <div
              className={`grid w-full items-center gap-4 transition-all duration-300 ${inviteMember.isPending ? 'blur-sm' : ''}`}
            >
              <FieldGroup className="grid w-full items-center gap-4">
                <Field
                  name="email"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
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
              </FieldGroup>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              disabled={!state.canSubmit || inviteMember.isPending}
            >
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMember;
