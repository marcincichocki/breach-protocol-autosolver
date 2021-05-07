import { HistoryEntry } from '@/client-electron/common';
import {
  BreachProtocolFragmentResult,
  BreachProtocolGridFragmentResult,
  FragmentId,
} from '@/core';
import { FC } from 'react';
import { GridViewer } from './GridViewer';

function getFragment<T extends BreachProtocolFragmentResult<any>>(
  id: FragmentId
) {
  return (f: BreachProtocolFragmentResult<any>): f is T => f.id === id;
}

const getGrid = getFragment<BreachProtocolGridFragmentResult>('grid');

interface HistoryViewerProps {
  entry: HistoryEntry;
}

export const HistoryViewer: FC<HistoryViewerProps> = ({ entry }) => {
  const { rawData } = entry.fragments.find(getGrid);
  const { path } = entry.result;

  return <GridViewer {...{ rawData, path }} />;
};
