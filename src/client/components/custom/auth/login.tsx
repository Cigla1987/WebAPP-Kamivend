import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '#/client/components/ui/button';
import { FieldGroup } from '#/client/components/ui/field';
import { Alert, AlertTitle } from '#/client/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import LoadingSpinner from '../loading-spinner';
import authClient from '#/client/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';
import { FormInput } from '#/client/components/ui/form-fields';
import { z } from 'zod';

const loginSchema = z.object({
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

  const { Field, handleSubmit, state } = useForm({
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
          navigate({ to: '/dashboard' });
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
        handleSubmit();
      }}
      className="space-y-8"
    >
      <FieldGroup className="grid w-full items-center gap-6">
        <Field
          name="email"
          children={(field) => (
            <FormInput
              field={field}
              label="Email address"
              onChange={() => error && setError(null)}
            />
          )}
        />

        <Field
          name="password"
          children={(field) => (
            <FormInput
              field={field}
              label="Password"
              type="password"
              onChange={() => error && setError(null)}
            />
          )}
        />

        <Button
          className="w-full"
          type="submit"
          disabled={isPending || !state.canSubmit}
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
