import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@vending/ui';
import { getAuthClient } from '../lib/auth-client';

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getAuthClient();
    client.getSession().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    const client = getAuthClient();
    await client.signOut();
    await window.desktop.store.delete('token');
    navigate({ to: '/login' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">Vending Desktop</h1>
      <p className="text-muted-foreground">
        Welcome, {user?.name || user?.email || 'User'}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
        <Button variant="destructive" onClick={() => window.desktop.quit()}>
          Quit App
        </Button>
      </div>
    </main>
  );
}
