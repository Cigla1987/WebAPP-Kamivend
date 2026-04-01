import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'
import { Button } from '#/components/ui/button'
import { MenuIcon, MountainIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'

const Navbar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const handleScroll = () => {
    const currentScrollY = window.scrollY

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsVisible(false)
    } else {
      setIsVisible(true)
    }

    setLastScrollY(currentScrollY)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])
  return (
    <header
      className={`sticky top-0 z-50 w-full bg-background py-4 shadow-md transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } dark:after:absolute dark:after:bottom-0 dark:after:left-0 dark:after:h-px dark:after:w-full dark:after:scale-x-100 dark:after:bg-accent dark:after:content-['']`}
    >
      <div className="flex items-center justify-between px-4 md:px-6">
        <Link to="/" className="text-lg font-bold">
          <MountainIcon className="h-6 w-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {}
          <Link
            to="/"
            className="hover:text-black-300 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-[.99] dark:after:bg-white sm:after:w-full"
          >
            Home
          </Link>
          <Link
            to="/"
            className="hover:text-black-300 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-[.99] dark:after:bg-white sm:after:w-full"
          >
            About
          </Link>
          <Link
            to="/"
            className="hover:text-black-300 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-[.99] dark:after:bg-white sm:after:w-full"
          >
            Services
          </Link>
          <Link
            to="/"
            className="hover:text-black-300 relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:scale-x-[.99] dark:after:bg-white sm:after:w-full"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden md:block">
            <Button variant="default">Login</Button>
          </Link>

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="md:hidden">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              }
            ></SheetTrigger>
            <SheetContent side="right" className="">
              <SheetTitle>Menu</SheetTitle>
              <div className="grid gap-4 p-6">
                <Link
                  to="/"
                  className="relative text-lg font-medium after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:-translate-x-1/4 hover:after:scale-x-50 dark:after:bg-white sm:after:w-full"
                >
                  Home
                </Link>
                <Link
                  to="/"
                  className="relative text-lg font-medium after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:-translate-x-1/4 hover:after:scale-x-50 dark:after:bg-white sm:after:w-full"
                >
                  About
                </Link>
                <Link
                  to="/"
                  className="relative text-lg font-medium after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:-translate-x-1/4 hover:after:scale-x-50 dark:after:bg-white sm:after:w-full"
                >
                  Services
                </Link>
                <Link
                  to="/"
                  className="relative text-lg font-medium after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:scale-x-0 after:bg-black after:transition-transform after:duration-300 hover:after:-translate-x-1/4 hover:after:scale-x-50 dark:after:bg-white sm:after:w-full"
                >
                  Contact
                </Link>
                <Link to="/login" className="pt-4">
                  <Button variant="default" className="w-full">
                    Login
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Navbar
