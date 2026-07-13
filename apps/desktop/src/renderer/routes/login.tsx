import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import {
  Button,
  FieldGroup,
  FieldLabel,
  FieldError,
  Input,
  Alert,
  AlertTitle,
} from '@vending/ui';
import { AlertCircle } from 'lucide-react';
import { getAuthClient } from '../lib/auth-client';

const loginSchema = z.object({
  email: z.email({ error: 'Invalid email address.' }),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters long.' })
    .max(30, { error: 'Password must be at most 30 characters long.' }),
});

export default function LoginPage() {
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
        const client = getAuthClient();
        const result = await client.signIn.email({
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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Vending Desktop</h1>
      <p className="text-muted-foreground">Sign in to your account</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
        className="w-full max-w-sm space-y-8"
      >
        <FieldGroup className="grid w-full items-center gap-6">
          <Field
            name="email"
            children={(field) => (
              <div className="flex flex-col space-y-1.5">
                <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    if (error) setError(null);
                  }}
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
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    if (error) setError(null);
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </div>
            )}
          />
          <Button
            className="w-full"
            type="submit"
            disabled={isPending || !state.canSubmit}
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
          {error && (
            <Alert variant="destructive" className="bg-destructive/20 w-full">
              <AlertCircle />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </FieldGroup>
      </form>
    </main>
  );
}
