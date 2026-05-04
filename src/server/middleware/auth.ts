import { createMiddleware } from '@tanstack/react-start';
import type { User } from '../schemas/auth';
import { getSession } from '#/lib/auth-isomorphic';

export interface AuthContext {
  user: User;
}

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return next({
    context: {
      user: session.user as User,
    },
  });
});

// export function requireRole(allowedRoles: string[]) {
//   return createMiddleware().server(async ({ next }) => {
//     const session = await getSession();
//
//     if (!session) {
//       throw new Error('Unauthorized');
//     }
//
//     const userRole = session.user.role;
//     if (!allowedRoles.includes(userRole)) {
//       throw new Error('Forbidden: Insufficient permissions');
//     }
//
//     return next({
//       context: {
//         user: session.user as User,
//       },
//     });
//   });
// }
