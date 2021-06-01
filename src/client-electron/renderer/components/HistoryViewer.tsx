import { HistoryEntry } from '@/client-electron/common';
import {
  isBufferSizeFragment,
  isDaemonsFragment,
  isGridFragment,
} from '@/core/common';
import { FC, useState } from 'react';
import { BufferSizeViewer } from './BufferSizeViewer';
import { DaemonsViewer } from './DaemonsViewer';
import { Col, Row } from './Flex';
import { GridViewer } from './GridViewer';

export interface Highlight {
  from: number;
  to: number;
}

interface HistoryViewerProps {
  entry: HistoryEntry;
}

export const HistoryViewer: FC<HistoryViewerProps> = ({ entry }) => {
  const [highlight, setHighlight] = useState<Highlight>(null);
  const { rawData: grid } = entry.fragments.find(isGridFragment);
  const { rawData: bufferSize } = entry.fragments.find(isBufferSizeFragment);
  const { rawData: daemons } = entry.fragments.find(isDaemonsFragment);
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
