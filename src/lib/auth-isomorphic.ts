import { createIsomorphicFn } from '@tanstack/react-start';
import authClient from '#/client/lib/auth-client';

export const getSession = createIsomorphicFn()
  .server(async () => {
    const { auth } = await import('#/server/lib/auth');
    const { getRequest } = await import('@tanstack/react-start/server');
    const request = getRequest();
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session;
  })
  .client(async () => {
    const { data } = await authClient.getSession();
    return data;
  });
