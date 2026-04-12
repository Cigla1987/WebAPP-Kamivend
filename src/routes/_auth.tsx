import { SidebarProvider } from '#/client/components/ui/sidebar';
import { authClient } from '#/client/lib/auth-client';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();

    if (session.data === null || !session.data?.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }

    return {
      user: session.data.user,
    };
  },
  component: AuthenticatedLayout,
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
