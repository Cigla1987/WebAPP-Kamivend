import { createHashHistory, createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { getAuthClient } from './lib/auth-client';
import LoginPage from './routes/login';
import HomePage from './routes/home';

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: async () => {
    const client = getAuthClient();
    const { data: session } = await client.getSession();
    if (session) {
      throw redirect({ to: '/' });
    }
  },
  component: LoginPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    const client = getAuthClient();
    const { data: session } = await client.getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
    return { session };
  },
  component: HomePage,
});

export const routeTree = rootRoute.addChildren([loginRoute, indexRoute]);

const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
