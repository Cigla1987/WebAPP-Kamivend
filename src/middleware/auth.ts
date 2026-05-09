import { createMiddleware } from '@tanstack/react-start';
import { getSessionFn } from '#/utils/session';

export const authMiddlewareFn = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await getSessionFn();

    return next({
      context: {
        user: session.user,
      },
    });
  }
);

// export const authMiddleware = createMiddleware({ type: 'request' }).server(
//   async ({ next }) => {
//     // const url = new URL(request.url);
//     // if (
//     //   !url.pathname.startsWith('/dashboard') ||
//     //   !url.pathname.startsWith('/machines')
//     // ) {
//     //   return next();
//     // }
//     //
//     const headers = getRequestHeaders();
//     const session = await auth.api.getSession({ headers });
//
//     console.log('authMiddleware', session, Date.now());
//     if (!session) {
//       throw redirect({ to: '/login' });
//     }
//
//     return next({
//       context: {
//         user: session.user as User,
//       },
//     });
//   }
// );

// // export function requireRole(allowedRoles: string[]) {
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
//
