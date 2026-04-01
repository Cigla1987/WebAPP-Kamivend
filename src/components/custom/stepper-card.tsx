import React from 'react'
import { useInView } from 'react-intersection-observer'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

type StepperCardProps = {
  step: number
  side: 'left' | 'right' | string
  title: string
  description: string
  content: string
}

type StepperCardPropsObject = {
  props: StepperCardProps
}

const StepperCard: React.FC<StepperCardPropsObject> = ({ props }) => {
  const { step, side, title, description, content } = props

  const isRightSide = side === 'right'

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.8,
  })

  return (
    <div
      className={`relative mx-auto grid w-full grid-cols-1 items-start justify-center pb-10 last:mb-2 last:pb-0 sm:mx-0 sm:w-[48%] ${isRightSide ? 'sm:left-1/2 sm:grid-cols-[auto_1fr]' : 'sm:right-1/2 sm:ml-auto sm:grid-cols-[1fr_auto]'}`}
    >
      {isRightSide && (
        <div className={`hidden sm:flex sm:items-center sm:justify-center`}>
          <div
            className={`absolute z-10 flex h-8 w-8 items-center justify-center  bg-primary font-medium text-primary-foreground opacity-0 ${inView ? 'ease-[cubic-bezier(0.4, 0, 0.2, 1)] opacity-100 duration-700 animate-in fade-in' : ''}`}
          >
            {step}
          </div>
          <div
            className={`absolute top-0 w-px bg-border transition-all duration-700 dark:bg-accent ${inView ? 'h-full' : 'h-0'}`}
          />
        </div>
      )}
      <Card
        ref={ref}
        className={`${isRightSide ? 'justify-self-start sm:ml-6' : 'justify-self-end sm:mr-6'} w-full  border bg-card text-card-foreground opacity-0 shadow-md ${inView ? (isRightSide ? 'ease-[cubic-bezier(0.4, 0, 0.2, 1)] opacity-100 duration-300 animate-in slide-in-from-right-1/2' : 'ease-[cubic-bezier(0.4, 0, 0.2, 1)] opacity-100 duration-300 animate-in slide-in-from-left-1/2') : ''}`}
      >
        <CardHeader>
          <CardTitle>
            {title} {step}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <p>{content}</p>
          </div>
        </CardContent>
      </Card>
      {!isRightSide && (
        <div className={`hidden sm:flex sm:items-center sm:justify-center`}>
          <div
            className={`absolute z-10 flex h-8 w-8 items-center justify-center bg-primary font-medium text-primary-foreground opacity-0 ${inView ? 'ease-[cubic-bezier(0.4, 0, 0.2, 1)] opacity-100 duration-700 animate-in fade-in' : ''}`}
          >
            {step}
          </div>
          <div
            className={`absolute top-0 w-px bg-border transition-all duration-700 dark:bg-accent ${inView ? 'h-full' : 'h-0'}`}
          />
        </div>
      )}
    </div>
  )
}

export default StepperCard
