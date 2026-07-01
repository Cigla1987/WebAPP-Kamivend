import { createFileRoute } from '@tanstack/react-router';
import Navbar from '#/client/components/custom/navbar';
import Hero from '#/client/components/custom/hero';
import Stepper from '#/client/components/custom/stepper';
import Features from '#/client/components/custom/features';
import { ReactLenis } from 'lenis/react';
import { ClientOnly } from '#/client/components/client-only';

export const Route = createFileRoute('/(public)/')({
  component: PublicPage,
});

function PublicPage() {
  return (
    <>
      <ClientOnly>
        <ReactLenis root>
          <Navbar />
          <div className="container mx-auto">
            <Hero />
            <Stepper />
            <Features />
          </div>
        </ReactLenis>
      </ClientOnly>
    </>
  );
}
