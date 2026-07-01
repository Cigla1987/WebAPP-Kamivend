import AppSidebar from '#/client/components/custom/app-sidebar';
import Header from '#/client/components/custom/header';
import { SidebarProvider } from '@vending/ui';
import { getSessionFn } from '#/utils/session';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.fetchQuery({
      queryKey: ['session'],
      queryFn: getSessionFn,
      staleTime: 1000 * 60 * 5,
    });

    if (!session) {
      throw redirect({ to: '/login' });
    }

    return {
      user: session.user,
      activeOrganization: session.activeOrganization,
      memberRole: session.memberRole!,
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
