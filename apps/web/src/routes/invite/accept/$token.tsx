import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@vending/ui';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@vending/ui';
import { Input } from '@vending/ui';
import { Alert, AlertTitle } from '@vending/ui';
import { AlertCircleIcon } from 'lucide-react';
import LoadingSpinner from '#/client/components/custom/loading-spinner';
import authClient from '#/client/lib/auth-client';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { getInvitationFn } from './-accept.functions';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters.')
    .regex(/[A-Z]/, 'Must contain uppercase letter.')
    .regex(/[a-z]/, 'Must contain lowercase letter.')
    .regex(/[0-9]/, 'Must contain a number.'),
  confirmPassword: z.string().min(1, 'Please confirm password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const Route = createFileRoute('/invite/accept/$token')({
  loader: async ({ params }) => {
    const invitation = await getInvitationFn({
      data: { token: params.token },
    });
    return { invitation };
  },
  component: AcceptInvitation,
});

function AcceptInvitation() {
  const { token } = Route.useParams();
  const { invitation } = Route.useLoaderData();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm text-center">
          <Alert variant="destructive" className="bg-destructive/20 w-full">
            <AlertCircleIcon />
            <AlertTitle>This invitation is invalid or has expired.</AlertTitle>
          </Alert>
        </div>
      </div>
    );
  }

  const acceptMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
    }) => {
      // First sign up
      const signupResult = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (signupResult.error) {
        throw new Error(signupResult.error.message || 'Failed to create account');
      }

      // Then accept the invitation
      const acceptResult = await authClient.organization.acceptInvitation({
        invitationId: token,
      });

      if (acceptResult.error) {
        throw new Error(
          acceptResult.error.message || 'Failed to accept invitation'
        );
      }

      return acceptResult;
    },
    onSuccess: () => {
      navigate({ to: '/dashboard' });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'An error occurred');
    },
  });

  const signupForm = useForm({
    defaultValues: {
      name: '',
      email: invitation.email,
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      acceptMutation.mutate({
        name: value.name,
        email: value.email,
        password: value.password,
      });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold">Accept Invitation</h1>
        <p className="text-muted-foreground">
          Create your account to join the organization.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            signupForm.handleSubmit();
          }}
          className="space-y-8"
        >
          <FieldGroup className="grid w-full items-center gap-6">
            <signupForm.Field
              name="name"
              children={(field) => (
                <Field className="flex flex-col space-y-1.5">
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      if (error) setError(null);
                    }}
                  />
                  <FieldError
                    errors={[
                      { message: field.state.meta.errors?.[0]?.message },
                    ]}
                  />
                </Field>
              )}
            />

            <signupForm.Field
              name="email"
              children={(field) => (
                <Field className="flex flex-col space-y-1.5">
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <FieldError
                    errors={[
                      { message: field.state.meta.errors?.[0]?.message },
                    ]}
                  />
                </Field>
              )}
            />

            <signupForm.Field
              name="password"
              children={(field) => (
                <Field className="flex flex-col space-y-1.5">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      if (error) setError(null);
                    }}
                  />
                  <FieldError
                    errors={field.state.meta.errors?.map((err) => ({
                      message: typeof err === 'string' ? err : err?.message,
                    }))}
                  />
                </Field>
              )}
            />

            <signupForm.Field
              name="confirmPassword"
              validators={{
                onChangeListenTo: ['password'],
                onChange: ({ value, fieldApi }) => {
                  if (value !== fieldApi.form.getFieldValue('password')) {
                    return 'Passwords do not match';
                  }
                  return undefined;
                },
              }}
              children={(field) => (
                <Field className="flex flex-col space-y-1.5">
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      if (error) setError(null);
                    }}
                  />
                  <FieldError
                    errors={field.state.meta.errors?.map((err) => ({
                      message: typeof err === 'string' ? err : err?.message,
                    }))}
                  />
                </Field>
              )}
            />

            <Button
              className="w-full"
              type="submit"
              disabled={
                !signupForm.state.canSubmit || acceptMutation.isPending
              }
            >
              {acceptMutation.isPending ? (
                <LoadingSpinner size={48} />
              ) : (
                <span>Accept Invitation</span>
              )}
            </Button>

            {error && (
              <Alert
                variant="destructive"
                className="bg-destructive/20 w-full"
              >
                <AlertCircleIcon />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
