import React from 'react';
import StepperCard from './stepper-card';

const Stepper: React.FC = () => {
  const stepperList = [
    {
      step: 1,
      side: 'right',
      title: 'Step1',
      description: 'Description1',
      content: 'Content1',
    },
    {
      step: 2,
      side: 'left',
      title: 'Step2',
      description: 'Description2',
      content: 'Content2',
    },
    {
      step: 3,
      side: 'right',
      title: 'Step3',
      description: 'Description3',
      content: 'Content3',
    },
    {
      step: 4,
      side: 'left',
      title: 'Step4',
      description: 'Description4',
      content: 'Content4',
    },
  ];

  return (
    // <div className="container relative overflow-x-hidden py-12 sm:py-16 md:py-20">
    <div className="container relative overflow-x-hidden pt-4">
      {/* <div className="absolute inset-0 left-6 hidden h-full w-px bg-border dark:bg-accent sm:left-1/2 sm:block" /> */}
      <div className="relative grid">
        {stepperList.map((item, index) => (
          <StepperCard key={index} props={item} />
        ))}
      </div>
    </div>
  );
};

export default Stepper;
