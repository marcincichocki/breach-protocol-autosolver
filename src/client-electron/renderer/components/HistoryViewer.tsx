import { HistoryEntry } from '@/client-electron/common';
import {
  BreachProtocolBufferSizeFragmentResult,
  BreachProtocolDaemonsFragmentResult,
  BreachProtocolFragmentResult,
  BreachProtocolGridFragmentResult,
  FragmentId,
} from '@/core';
import { FC, useState } from 'react';
import { BufferSizeViewer } from './BufferSizeViewer';
import { DaemonsViewer } from './DaemonsViewer';
import { Col, Row } from './Flex';
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

export interface Highlight {
  from: number;
  to: number;
}

interface HistoryViewerProps {
  entry: HistoryEntry;
}

export const HistoryViewer: FC<HistoryViewerProps> = ({ entry }) => {
  const [highlight, setHighlight] = useState<Highlight>(null);
  const { rawData: grid } = entry.fragments.find(getGrid);
  const { rawData: bufferSize } = entry.fragments.find(getBufferSize);
  const { rawData: daemons } = entry.fragments.find(getDaemons);
  const { path } = entry.result;

  return (
    <Row style={{ gap: '1rem' }}>
      <GridViewer grid={grid} path={path} highlight={highlight} />
      <Col style={{ flexGrow: 1, gap: '1rem' }}>
        <BufferSizeViewer
          bufferSize={bufferSize}
          result={entry.result}
          onHighlight={setHighlight}
        />
        <DaemonsViewer
          daemons={daemons}
          result={entry.result}
          onHighlight={setHighlight}
        />
      </Col>
    </Row>
  );
};
