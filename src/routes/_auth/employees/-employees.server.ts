/**
 * ⚠️ SERVER-ONLY FILE
 * This file is protected by TanStack Start import protection.
 * It CANNOT be imported by client-side code for VALUES.
 * TYPE-ONLY imports are allowed (thanks to PR #7305).
 */

import { db } from '@/server/db';
import { UserRole } from '#/shared/enums';
import { user } from '#/server/db/schema/auth';
import { eq } from 'drizzle-orm';
import { auth } from '#/server/lib/auth';
import type { User } from '#/server/schemas/auth';
import z from 'zod';

export type EmployeeDto = {
  id: string;
  name: string;
  email: string;
  role: string;
  ownerId: string | null;
  createdAt: Date | null;
};

export const createEmployeeApiSchema = z
  .object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.email('Invalid email address'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type CreateEmployee = Omit<
  z.infer<typeof createEmployeeApiSchema>,
  'confirmPassword'
>;

export async function getEmployees(
  currentUser: Pick<User, 'id' | 'role'>
): Promise<EmployeeDto[]> {
  const userId = currentUser.id;
  const role = currentUser.role;

  const baseQuery = db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ownerId: user.ownerId,
      createdAt: user.createdAt,
    })
    .from(user);

  let results: EmployeeDto[];

  // TODO: Revert to owner-only when multi-tenancy is clarified
  if (role === UserRole.Superadmin) {
    results = await baseQuery;
  } else if (role === UserRole.Owner) {
    results = await baseQuery.where(eq(user.ownerId, userId));
  } else {
    throw new Error('Unauthorized');
  }

  return results;
}

export async function createEmployee(
  data: CreateEmployee,
  currentUser: Pick<User, 'id' | 'role'>
): Promise<EmployeeDto> {
  // TODO: Revert to owner-only when multi-tenancy is clarified
  if (currentUser.role !== UserRole.Owner && currentUser.role !== UserRole.Superadmin) {
    throw new Error('Unauthorized');
  }

  const result = await auth.api.createUser({
    body: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: UserRole.Employee,
      data: {
        ownerId: currentUser.id,
      },
    },
  });

  if (!result.user) {
    throw new Error('Failed to create employee');
  }

  const [employee] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ownerId: user.ownerId,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, result.user.id));

  return employee;
}
