import { createIsomorphicFn } from '@tanstack/react-start';
import authClient from '#/client/lib/auth-client';
import { redirect } from '@tanstack/react-router';

export const getSession = createIsomorphicFn()
  .server(async () => {
    const { auth } = await import('#/server/lib/auth');
    const { getRequest } = await import('@tanstack/react-start/server');
    const request = getRequest();
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    console.log('server.gs', session, request.url);
    // console.log('headers', request.headers);
    if (!session) {
      console.log('server.redirect to login');

      redirect({ to: '/login' });
    }
    return session;
  })
  .client(async () => {
    const { data } = await authClient.getSession();
    console.log('client.gs');
    if (!data?.session) {
      redirect({ to: '/login' });
    }
    return data;
  });
