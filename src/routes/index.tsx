import { createFileRoute } from '@tanstack/react-router'
import { ReactLenis } from 'lenis/react'
import Hero from '#/components/custom/hero'
import Navbar from '#/components/custom/navbar'
import Stepper from '#/components/custom/stepper'
import Features from '#/components/custom/features'

export const Route = createFileRoute('/')({
  component: PublicPage,
})

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
  )
}
