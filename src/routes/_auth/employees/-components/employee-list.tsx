import { type FC } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { getRouteApi } from '@tanstack/react-router';
import { UserRole } from '#/shared/enums';
import TabbedList from '#/client/components/custom/tabbed-list';
import type { EmployeeDto } from '../-employees.server';
import AddEmployee from './add-employee';

const authenticatedRoute = getRouteApi('/_auth');

interface EmployeesListProps {
  employees: EmployeeDto[];
  tableColumns: ColumnDef<EmployeeDto>[];
}

const EmployeesList: FC<EmployeesListProps> = ({ employees, tableColumns }) => {
  const { user } = authenticatedRoute.useRouteContext();

  // TODO: Revert to owner-only when multi-tenancy is clarified
  const actions = (user.role === UserRole.Owner ||
    user.role === UserRole.Superadmin) && <AddEmployee />;

  return <TabbedList data={employees} columns={tableColumns} actions={actions} />;
};

export default EmployeesList;
