import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { getAuthClient } from './lib/auth-client';
import LoginPage from './routes/login';
import HomePage from './routes/home';
import CustomerPage from './routes/customer';

async function getSessionOrNull() {
  try {
    const { data: session } = await getAuthClient().getSession();
    return session;
  } catch {
    return null;
  }
}

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  ),
});

const customerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CustomerPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  beforeLoad: async () => {
    const session = await getSessionOrNull();
    if (session) throw redirect({ to: '/admin' });
  },
  component: LoginPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: async () => {
    const session = await getSessionOrNull();
    if (!session) throw redirect({ to: '/admin/login' });
    return { session };
  },
  component: HomePage,
});

export const routeTree = rootRoute.addChildren([
  customerRoute,
  adminLoginRoute,
  adminRoute,
]);

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
