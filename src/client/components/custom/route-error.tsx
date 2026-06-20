import { useNavigate, type ErrorComponentProps } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '#/client/components/ui/card';
import { Button } from '#/client/components/ui/button';

export default function RouteError({ error, reset }: ErrorComponentProps) {
  const navigate = useNavigate();

  const isForbidden = error instanceof Error && error.message === 'Forbidden';

  if (isForbidden) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-destructive mb-2 flex items-center gap-2">
              <ShieldAlert className="size-5" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You do not have permission to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Go Home
            </Button>
            <Button variant="ghost" onClick={reset}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">
            Something went wrong
          </CardTitle>
          <CardDescription>
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Go Home
          </Button>
          <Button variant="ghost" onClick={reset}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
