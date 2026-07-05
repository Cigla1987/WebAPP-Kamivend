import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/pictures')({
  staticData: { title: 'Pictures' },
  component: PicturesRoute,
});

function PicturesRoute() {
  return <Outlet />;
}
