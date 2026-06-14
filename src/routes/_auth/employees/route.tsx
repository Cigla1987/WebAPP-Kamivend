import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/employees')({
  staticData: { title: 'Employees' },
  component: EmployeesRoute,
});

function EmployeesRoute() {
  return <Outlet />;
}
