import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { picturesQueryOptions } from './-pictures.queries';
import { getColumns } from './-components/columns';
import PicturesList from './-components/picture-list';

export const Route = createFileRoute('/_auth/pictures/')({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(picturesQueryOptions());
  },
  pendingComponent: () => <p className="text-9xl text-white">loading</p>,
  component: PicturesIndex,
});

function PicturesIndex() {
  const { data: pictures } = useSuspenseQuery(picturesQueryOptions());
  const columns = getColumns();

  return <PicturesList pictures={pictures} tableColumns={columns} />;
}
