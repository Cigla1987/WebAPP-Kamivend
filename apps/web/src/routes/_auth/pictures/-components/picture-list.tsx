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
  return (
    <TabbedList
      data={pictures}
      columns={tableColumns}
      actions={<CreatePicture />}
    />
  );
};

export default PicturesList;
