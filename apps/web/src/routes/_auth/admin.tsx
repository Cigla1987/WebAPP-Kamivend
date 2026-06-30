import { createFileRoute, redirect } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { organizationsQueryOptions } from './-admin.queries';
import { UserRole } from '@vending/domain';
import { getRouteApi } from '@tanstack/react-router';
import { Button } from '@vending/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@vending/ui';
import { useNavigate } from '@tanstack/react-router';
import authClient from '#/client/lib/auth-client';

const authenticatedRoute = getRouteApi('/_auth');

export const Route = createFileRoute('/_auth/admin')({
  staticData: { title: 'Admin' },
  beforeLoad: async ({ context }) => {
    // Ensure user is admin
    if (context.user.role !== UserRole.Admin) {
      throw redirect({ to: '/dashboard' });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(organizationsQueryOptions());
  },
  component: AdminPage,
});

function AdminPage() {
  const { user } = authenticatedRoute.useRouteContext();
  const { data: organizations } = useSuspenseQuery(organizationsQueryOptions());

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-4">
        Logged in as {user.name} ({user.role})
      </p>

      <h2 className="mb-4 text-xl font-semibold">Organizations</h2>
      <div className="grid gap-4">
        {organizations?.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <CardTitle>{org.name}</CardTitle>
              <CardDescription>{org.slug}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end"></CardContent>
          </Card>
        ))}
        {organizations?.length === 0 && (
          <p className="text-muted-foreground">No organizations found.</p>
        )}
      </div>
    </div>
  );
}
