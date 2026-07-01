import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import Navbar from '#/client/components/custom/navbar';
import Hero from '#/client/components/custom/hero';
import Stepper from '#/client/components/custom/stepper';
import Features from '#/client/components/custom/features';
import { ReactLenis } from 'lenis/react';
import { getSessionFn } from '#/utils/session';

const getHostFn = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  return headers.get('host') || '';
});

export const Route = createFileRoute('/(public)/')({
  beforeLoad: async ({ context }) => {
    const host = await getHostFn();
    const isAppDomain = host === 'app.kamivend.com' || host.startsWith('app.');

    if (isAppDomain) {
      // getSessionFn throws redirect({ to: '/login' }) when unauthenticated
      await context.queryClient.fetchQuery({
        queryKey: ['session'],
        queryFn: getSessionFn,
        staleTime: 1000 * 60 * 5,
      });

      // Authenticated — send to app entry point
      throw redirect({ to: '/dashboard' });
    }
  },
  component: PublicPage,
});

function PublicPage() {
  return (
    <>
      <ReactLenis root>
        <Navbar />
        <div className="container mx-auto">
          <Hero />
          <Stepper />
          <Features />
        </div>
      </ReactLenis>
    </>
  );
}
