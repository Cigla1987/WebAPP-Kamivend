import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
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
import { AlertCircleIcon } from 'lucide-react';
import LoadingSpinner from '../loading-spinner';
import { Alert, AlertTitle } from '#/components/ui/alert';
import { authClient } from '#/lib/auth-client';
import { useNavigate } from '@tanstack/react-router';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters'),
});

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
    },
  });

  // Watch for form changes to reset error
  const formValues = signupForm.watch();
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

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsPending(true);
    setError(null);

    try {
      const result = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.username,
      });

      if (result.error) {
        setError(result.error.message || 'Signup failed');
      } else {
        // Navigate to dashboard or home after successful signup
        navigate({ to: '/' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...signupForm}>
      <form onSubmit={signupForm.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid w-full items-center gap-6">
          <FormField
            control={signupForm.control}
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
            control={signupForm.control}
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
          <FormField
            control={signupForm.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-1.5">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? <LoadingSpinner size={48} /> : <span>Signup</span>}
          </Button>
          {error ? (
            <Alert variant="destructive" className="bg-destructive/20">
              <AlertCircleIcon />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          ) : null}
        </div>
      </form>
    </Form>
  );
};

export default Signup;
