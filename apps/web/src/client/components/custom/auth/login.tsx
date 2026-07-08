import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  Button,
  FieldGroup,
  Alert,
  AlertTitle,
  FormInput,
  FieldLabel,
  FieldError,
  Input,
} from '@vending/ui';
import { AlertCircleIcon, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../loading-spinner';
import authClient from '#/client/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
          queryClient.invalidateQueries({ queryKey: ['session'] });
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
          children={(field) => {
            const errorMessage = Array.isArray(field.state.meta.errors)
              ? typeof field.state.meta.errors[0] === 'string'
                ? field.state.meta.errors[0]
                : field.state.meta.errors[0]?.message
              : undefined;

            return (
              <div className="flex flex-col space-y-1.5">
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? 'text' : 'password'}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      if (error) setError(null);
                    }}
                    className="pr-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 h-8 w-8"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {errorMessage && (
                  <FieldError errors={[{ message: errorMessage }]} />
                )}
              </div>
            );
          }}
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
