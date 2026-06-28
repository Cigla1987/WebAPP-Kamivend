import { createMiddleware } from '@tanstack/react-start';
import { authMiddlewareFn } from './auth';

export function requireRole(...allowedRoles: string[]) {
  return createMiddleware({ type: 'function' })
    .middleware([authMiddlewareFn])
    .server(async ({ next, context }) => {
      const userRole = context.user.role;
      const memberRole = context.memberRole;

      const hasRole = allowedRoles.some(
        (role) => role === userRole || role === memberRole
      );

      if (!hasRole) {
        throw new Error(`Forbidden.`);
      }

      return next();
    });
}
