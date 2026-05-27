import { type FC } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import TabbedList from '#/client/components/custom/tabbed-list';
import type { PictureDto } from '../-pictures.server';
import CreatePicture from './create-picture';

interface PicturesListProps {
  pictures: PictureDto[];
  tableColumns: ColumnDef<PictureDto>[];
}

const PicturesList: FC<PicturesListProps> = ({ pictures, tableColumns }) => {
  const tabs = [
    {
      label: 'All',
      value: 'all',
      title: 'All pictures',
      description: 'Manage all your pictures and view their sales performance.',
    },
  ];

  return (
    <TabbedList
      data={pictures}
      tabs={tabs}
      columns={tableColumns}
      actions={<CreatePicture />}
    />
  );
};

export default PicturesList;
