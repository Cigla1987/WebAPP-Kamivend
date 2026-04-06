import AuthTabs from '#/client/components/custom/auth/auth-tabs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <AuthTabs />
    </div>
  );
}
