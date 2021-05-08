import { BreachProtocolStatus, HistoryEntry } from '@/client-electron/common';
import {
  BreachProtocolBufferSizeFragmentResult,
  BreachProtocolDaemonsFragmentResult,
  BreachProtocolFragmentResult,
  BreachProtocolGridFragmentResult,
  FragmentId,
} from '@/core';
import { FC } from 'react';
import { BufferSizeViewer } from './BufferSizeViewer';
import { DaemonsViewer } from './DaemonsViewer';
import { GridViewer } from './GridViewer';

function getFragment<T extends BreachProtocolFragmentResult<any>>(
  id: FragmentId
) {
  return (f: BreachProtocolFragmentResult<any>): f is T => f.id === id;
}

const getGrid = getFragment<BreachProtocolGridFragmentResult>('grid');
const getBufferSize = getFragment<BreachProtocolBufferSizeFragmentResult>(
  'bufferSize'
);
const getDaemons = getFragment<BreachProtocolDaemonsFragmentResult>('daemons');

interface HistoryViewerProps {
  entry: HistoryEntry;
}

export const HistoryViewer: FC<HistoryViewerProps> = ({ entry }) => {
  if (entry.status === BreachProtocolStatus.Rejected) {
    return null;
  }

  const { rawData } = entry.fragments.find(getGrid);
  const buffer = entry.fragments.find(getBufferSize);
  const daemonsFragment = entry.fragments.find(getDaemons);
  const daemons = daemonsFragment.rawData;
  const activeDaemons = entry.result.resolvedSequence.parts;
  const { path } = entry.result;

  return (
    <>
      <GridViewer {...{ rawData, path }} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: '1rem',
        }}
      >
        <BufferSizeViewer bufferSize={buffer.rawData} result={entry.result} />
        <DaemonsViewer daemons={daemons} activeDaemons={activeDaemons} />
      </div>
    </>
  );
};
