import {
  BreachProtocolResultJSON,
  isBufferSizeFragment,
  isDaemonsFragment,
  isGridFragment,
  isTypesFragment,
} from '@/core';
import { HistoryEntry } from '@/electron/common';
import { useState } from 'react';
import { BufferSizeViewer } from './BufferSizeViewer';
import { DaemonsViewer } from './DaemonsViewer';
import { Col, Row } from './Flex';
import { GridViewer } from './GridViewer';
import { TypesFragmentStatus } from './TypesFragmentStatus';

export interface Highlight {
  from: number;
  to: number;
}

interface HistoryViewerProps {
  entry: HistoryEntry;
  customResult?: BreachProtocolResultJSON;
}

export const HistoryViewer = ({ entry, customResult }: HistoryViewerProps) => {
  const [highlight, setHighlight] = useState<Highlight>(null);
  const { rawData: grid } = entry.fragments.find(isGridFragment);
  const { rawData: bufferSize } = entry.fragments.find(isBufferSizeFragment);
  const { rawData: daemons } = entry.fragments.find(isDaemonsFragment);
  const typesFragment = entry.fragments.find(isTypesFragment);
  const result = customResult || entry.result;

  return (
    <Row gap>
      <GridViewer grid={grid} path={result?.path} highlight={highlight} />
      <Col gap grow>
        <BufferSizeViewer
          bufferSize={bufferSize}
          result={result}
          onHighlight={setHighlight}
        />
        <DaemonsViewer
          types={typesFragment}
          daemons={daemons}
          result={result}
          onHighlight={setHighlight}
        />
        <TypesFragmentStatus types={typesFragment} />
      </Col>
    </Row>
  );
};
