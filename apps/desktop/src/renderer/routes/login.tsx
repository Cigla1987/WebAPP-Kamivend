import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import {
  Alert,
  AlertTitle,
  Button,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from '@vending/ui';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { getAuthClient } from '../lib/auth-client';

const loginSchema = z.object({
  email: z.email({ error: 'Invalid email address.' }),
  password: z.string().min(8, { error: 'Password must be at least 8 characters long.' }).max(30),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { Field, handleSubmit, state } = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await getAuthClient().signIn.email(value);
        if (result.error) {
          setError(result.error.message || 'Login failed');
        } else {
          navigate({ to: '/admin' });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsPending(false);
      }
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F4F6] p-6 text-[#333333]">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-sm">
        <Button variant="ghost" className="mb-7 -ml-3" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft size={18} /> Customer display
        </Button>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#E05D38]">Smart Fridge</p>
        <h1 className="mt-2 text-4xl font-black">Admin login</h1>
        <p className="mt-3 text-[#6B7280]">Use the same credentials as the Kamivend web application.</p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleSubmit();
          }}
          className="mt-8 space-y-7"
        >
          <FieldGroup className="grid w-full gap-6">
            <Field
              name="email"
              children={(field) => (
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      setError(null);
                    }}
                  />
                  {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                </div>
              )}
            />
            <Field
              name="password"
              children={(field) => (
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value);
                      setError(null);
                    }}
                  />
                  {field.state.meta.errors.length > 0 && <FieldError errors={field.state.meta.errors} />}
                </div>
              )}
            />
            <Button className="w-full bg-[#E05D38] hover:bg-[#E05D38]/90" type="submit" disabled={isPending || !state.canSubmit}>
              {isPending ? 'Signing in…' : 'Sign in'}
            </Button>
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}
          </FieldGroup>
        </form>
      </div>
    </main>
  );
}
