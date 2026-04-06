import { createFileRoute } from '@tanstack/react-router';
import { ReactLenis } from 'lenis/react';
import Hero from '#/client/components/custom/hero';
import Navbar from '#/client/components/custom/navbar';
import Stepper from '#/client/components/custom/stepper';
import Features from '#/client/components/custom/features';

export const Route = createFileRoute('/')({
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
