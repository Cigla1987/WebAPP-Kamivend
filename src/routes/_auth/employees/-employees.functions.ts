/**
 * Employees API Functions
 *
 * These are TanStack Start server functions that can be imported anywhere.
 * The handler code runs only on the server, while the client gets an RPC stub.
 *
 * Server-side logic is imported from -employees.server.ts (protected from client).
 */

import { createServerFn } from '@tanstack/react-start';
import {
  getEmployees,
  createEmployee,
  createEmployeeApiSchema,
} from './-employees.server';
import type { EmployeeDto } from './-employees.server';
import { authMiddlewareFn } from '#/middleware/auth';
import { errorMiddlewareFn } from '#/middleware/error';

export const getEmployeesFn = createServerFn({ method: 'GET' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .handler(async ({ context }): Promise<EmployeeDto[]> => {
    return getEmployees(context.user);
  });

export const createEmployeeFn = createServerFn({ method: 'POST' })
  .middleware([errorMiddlewareFn, authMiddlewareFn])
  .inputValidator(createEmployeeApiSchema)
  .handler(async ({ data, context }): Promise<EmployeeDto> => {
    return createEmployee(data, context.user);
  });
