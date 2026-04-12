// import { useLogoutMutation } from '@/queries/auth';
import { ModeToggle } from '#/client/components/ui/mode-toggle';
import { Button } from '#/client/components/ui/button';

const Header = () => {
  // const logoutMutation = useLogoutMutation();
  const content = (
    <header className="container mx-auto mt-2 sm:px-6">
      <nav className="flex items-center justify-end gap-3">
        <ModeToggle />
        <Button variant="outline">Logout</Button>
      </nav>
    </header>
  );

  return content;
};

export default Header;
