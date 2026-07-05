import { createHashHistory, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { Button } from '@vending/ui/components/button';
import { useEffect, useState } from 'react';

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function HomePage() {
    const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
      window.desktop.store.get('token').then((value) => {
        if (typeof value === 'string') {
          setToken(value);
        }
      });
    }, []);

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-4xl font-bold">Vending Desktop</h1>
        <p className="text-muted-foreground">
          Field technician app for managing vending machines.
        </p>
        <div className="rounded-lg border p-4 text-sm">
          <p>
            <strong>Stored token:</strong>{' '}
            {token ? token : 'none'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              await window.desktop.store.set('token', 'demo-token-123');
              const value = await window.desktop.store.get('token');
              setToken(typeof value === 'string' ? value : null);
            }}
          >
            Set demo token
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await window.desktop.store.delete('token');
              setToken(null);
            }}
          >
            Clear token
          </Button>
        </div>
      </main>
    );
  },
});

export const routeTree = rootRoute.addChildren([indexRoute]);

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
