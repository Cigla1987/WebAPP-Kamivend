import AppSidebar from '#/client/components/custom/app-sidebar';
import Header from '#/client/components/custom/header';
import { SidebarProvider } from '#/client/components/ui/sidebar';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getSession } from '#/lib/auth-isomorphic';
import { authMiddleware } from '#/server/middleware/auth';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session || !session.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    return {
      user: session.user,
    };
  },
  component: AuthenticatedLayout,
  server: {
    middleware: [authMiddleware],
  },
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 h-dvh w-full overflow-auto transition-colors duration-200 ease-in-out">
        <Header />
        <div className="mt-16">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
