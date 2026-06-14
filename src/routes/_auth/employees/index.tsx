import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { employeesQueryOptions } from './-employees.queries';
import { getColumns } from './-components/columns';
import EmployeesList from './-components/employee-list';

export const Route = createFileRoute('/_auth/employees/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(employeesQueryOptions());
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: EmployeesIndex,
});

function EmployeesIndex() {
  const { data: employees } = useSuspenseQuery(employeesQueryOptions());
  const columns = getColumns();

  return <EmployeesList employees={employees} tableColumns={columns} />;
}
