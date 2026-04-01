import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '#/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form';
import { Input } from '#/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertTitle } from '#/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';
import LoadingSpinner from '../loading-spinner';
import { authClient } from '#/lib/auth-client';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Watch for form changes to reset error
  const formValues = loginForm.watch();
  const prevValuesRef = useRef(formValues);
  useEffect(() => {
    if (
      JSON.stringify(formValues) !== JSON.stringify(prevValuesRef.current) &&
      error
    ) {
      setError(null);
    }
    prevValuesRef.current = formValues;
  }, [formValues, error]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsPending(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        setError(result.error.message || 'Login failed');
      } else {
        // Navigate to dashboard or home after successful login
        navigate({ to: '/' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid w-full items-center gap-6">
          <FormField
            control={loginForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? <LoadingSpinner size={48} /> : <span>Login</span>}
          </Button>

          {error && (
            <Alert variant="destructive" className="bg-destructive/20 w-full">
              <AlertCircleIcon />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </div>
      </form>
    </Form>
  );
};

export default Login;
