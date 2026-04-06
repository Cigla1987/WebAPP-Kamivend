import { useState } from 'react';
import { useForm } from '@tanstack/react-form';

import { Button } from '#/client/components/ui/button';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '#/client/components/ui/field';
import { Input } from '#/client/components/ui/input';
import { Alert, AlertTitle } from '#/client/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import LoadingSpinner from '../loading-spinner';
import { authClient } from '#/client/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ error: 'Invalid email address.' }),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters long.' })
    .max(30, { error: 'Password must be at most 30 characters long.' }),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setIsPending(true);
      setError(null);

      try {
        const result = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });

        if (result.error) {
          setError(result.error.message || 'Login failed');
        } else {
          navigate({ to: '/' });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsPending(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        loginForm.handleSubmit();
      }}
      className="space-y-8"
    >
      <FieldGroup className="grid w-full items-center gap-6">
        <loginForm.Field
          name="email"
          children={(field) => (
            <Field className="flex flex-col space-y-1.5">
              <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
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
                errors={[{ message: field.state.meta.errors?.[0]?.message }]}
              />
            </Field>
          )}
        ></loginForm.Field>

        <loginForm.Field
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
                errors={[{ message: field.state.meta.errors?.[0]?.message }]}
              />
            </Field>
          )}
        ></loginForm.Field>

        <Button
          className="w-full"
          type="submit"
          disabled={isPending || !loginForm.state.canSubmit}
        >
          {isPending ? <LoadingSpinner size={48} /> : <span>Login</span>}
        </Button>

        {error && (
          <Alert variant="destructive" className="bg-destructive/20 w-full">
            <AlertCircleIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
      </FieldGroup>
    </form>
  );
};

export default Login;
