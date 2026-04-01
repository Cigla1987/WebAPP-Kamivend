import { createFileRoute } from '@tanstack/react-router'
import AuthTabs from '#/components/custom/auth/auth-tabs'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex h-dvh justify-center items-center">
      <AuthTabs />
    </div>
  )
}
