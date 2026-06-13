import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/dashboard')({
  staticData: { title: 'Dashboard' },
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();

  return (
    <div>
      <h1>asdasd</h1>
      <h1>Welcome, {user?.name}</h1>
      <h1>Role: {user?.role}</h1>
    </div>
  );
}
