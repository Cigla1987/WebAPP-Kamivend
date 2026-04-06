import React from 'react';
import { buttonVariants } from '../ui/button';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full">
      <div className="relative pt-32 pb-56 md:pt-20 md:pb-64 lg:pt-24 lg:pb-64">
        <div className="container">
          <div className="ease-[cubic-bezier(0.4, 0, 0.2, 1)] animate-in fade-in-0 slide-in-from-top-10 max-w-full space-y-6 text-center text-balance duration-700 xl:max-w-xl xl:text-left">
            <h1 className="bg-linear-to-r bg-clip-text text-3xl font-bold tracking-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-snug lg:text-6xl lg:leading-tight dark:from-white dark:to-gray-500 dark:text-transparent">
              Innovative Vending Solutions for Every Need
            </h1>
            <p className="md:text-xl">
              From snacks and beverages to personal care items, our
              state-of-the-art vending machines cater to all your needs. Elevate
              your business with our reliable and customizable solutions.
            </p>
            <a
              href="#"
              className={buttonVariants({ variant: 'default', size: 'lg' })}
            >
              Explore Our Machines
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
