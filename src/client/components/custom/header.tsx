import { useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ModeToggle } from '#/client/components/ui/mode-toggle';
import { Button } from '#/client/components/ui/button';
import authClient from '#/client/lib/auth-client';

const Header = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await authClient.signOut();
    queryClient.invalidateQueries({ queryKey: ['session'] });
    router.navigate({ to: '/login' });
  };

  return (
    <header className="container mx-auto mt-2 sm:px-6">
      <nav className="flex items-center justify-end gap-3">
        <ModeToggle />
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </nav>
    </header>
  );
};

export default Header;
