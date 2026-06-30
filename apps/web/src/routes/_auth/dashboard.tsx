import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@vending/ui';
import { UserRole } from '@vending/domain';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@vending/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@vending/ui';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@vending/ui';
import { Input } from '@vending/ui';
import authClient from '#/client/lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
});

export const Route = createFileRoute('/_auth/dashboard')({
  staticData: { title: 'Dashboard' },
  component: Dashboard,
});

function Dashboard() {
  const { user, activeOrganization } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrgForm = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: createOrgSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const result = await authClient.organization.create({
          name: value.name,
          slug: value.name.toLowerCase().replace(/\s+/g, '-'),
        });

        if (result.error) {
          setError(result.error.message || 'Failed to create organization');
        } else {
          setShowDialog(false);
          // Invalidate session query to get updated active organization
          queryClient.invalidateQueries({ queryKey: ['session'] });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome, {user?.name} ({user?.role})
      </p>
      {activeOrganization && (
        <p className="mt-2 text-sm text-muted-foreground">
          Active Organization: {activeOrganization.name}
        </p>
      )}

      {!activeOrganization && user?.role !== UserRole.Admin && (
        <>
          <Card
            className="mt-6 max-w-md cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setShowDialog(true)}
          >
            <CardHeader>
              <CardTitle>Create Organization</CardTitle>
              <CardDescription>
                Click here to create an organization and get started.
              </CardDescription>
            </CardHeader>
          </Card>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  createOrgForm.handleSubmit();
                }}
              >
                <FieldGroup className="grid gap-4">
                  <createOrgForm.Field
                    name="name"
                    children={(field) => (
                      <Field className="flex flex-col space-y-1.5">
                        <FieldLabel htmlFor={field.name}>
                          Organization Name
                        </FieldLabel>
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

                  <Button
                    type="submit"
                    disabled={!createOrgForm.state.canSubmit}
                  >
                    Create Organization
                  </Button>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                </FieldGroup>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
