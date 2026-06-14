import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { PlusCircle, Eye, EyeOff } from 'lucide-react';
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
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createEmployeeFn } from '../-employees.functions';

const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required.').trim(),
  email: z.email('Invalid email address.'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters.')
    .regex(/[A-Z]/, 'Must contain uppercase letter.')
    .regex(/[a-z]/, 'Must contain lowercase letter.')
    .regex(/[0-9]/, 'Must contain a number.'),
  confirmPassword: z.string().min(1, 'Please confirm password.'),
});

const AddEmployee = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createEmployeeFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employees'],
      });
      setIsDialogOpen(false);
      toast.success('Employee created successfully');
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to create employee';
      toast.error(message);
    },
  });

  const { Field, handleSubmit, state } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const parsed = createEmployeeSchema.safeParse(value);
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
      mutation.mutate({
        data: {
          name: value.name,
          email: value.email,
          password: value.password,
          confirmPassword: value.confirmPassword,
        },
      });
    },
  });

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setShowPassword(false);
          setShowConfirmPassword(false);
        }
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
              Add employee
            </span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader
          className={`transition-all duration-300 ${mutation.isPending ? 'blur-sm' : ''}`}
        >
          <DialogTitle>Add employee</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
        >
          <div className="relative">
            {mutation.isPending && (
              <div className="absolute inset-x-0 top-1/4 text-center">
                Creating employee...
              </div>
            )}
            <div
              className={`grid w-full items-center gap-4 transition-all duration-300 ${mutation.isPending ? 'blur-sm' : ''}`}
            >
              <FieldGroup className="grid w-full items-center gap-4">
                <Field
                  name="name"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
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

                <Field
                  name="password"
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={showPassword ? 'text' : 'password'}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(e.target.value)
                          }
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {field.state.meta.errors.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </div>
                  )}
                />

                <Field
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ['password'],
                    onChange: ({ value, fieldApi }) => {
                      if (
                        value &&
                        value !== fieldApi.form.getFieldValue('password')
                      ) {
                        return 'Passwords do not match';
                      }
                      return undefined;
                    },
                  }}
                  children={(field) => (
                    <div className="flex flex-col space-y-1.5">
                      <FieldLabel htmlFor={field.name}>
                        Confirm password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(e.target.value)
                          }
                          aria-invalid={field.state.meta.errors.length > 0}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
              disabled={!state.canSubmit || mutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployee;
