import { createMiddleware } from '@tanstack/react-start';
import { getSessionFn } from '#/utils/session';

export const authMiddlewareFn = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await getSessionFn();

    if (!session) {
      throw new Error('Unauthorized');
    }

    return next({
      context: {
        user: {
          ...session.user,
          role: session.user.role!,
        },
        activeOrganization: session.activeOrganization,
        memberRole: session.memberRole,
      },
    });
  }
);
