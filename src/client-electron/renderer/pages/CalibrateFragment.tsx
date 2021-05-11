import { HistoryEntry } from '@/client-electron/common';
import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { FragmentPreview } from '../components/FragmentPreview';

interface CalibrateFragmentProps {
  entry: HistoryEntry;
}

export const CalibrateFragment: FC<CalibrateFragmentProps> = ({ entry }) => {
  const { fragmentId } = useParams<{ fragmentId: string }>();
  const { image, source } = entry.fragments.find((f) => f.id === fragmentId);

  return (
    <>
      <FragmentPreview image={image} source={source} />
    </>
  );
};
