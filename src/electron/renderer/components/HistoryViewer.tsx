import {
  BreachProtocolResultJSON,
  BUFFER_SIZE_MIN,
  DaemonsRawData,
  HexCodeSequence,
  isBufferSizeFragment,
  isDaemonsFragment,
  isGridFragment,
  isTypesFragment,
  SequenceJSON,
} from '@/core';
import { HistoryEntry } from '@/electron/common';
import { useCallback, useState } from 'react';
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
  sortDaemonsBySequence?: boolean;
}

function getDaemonBounds(daemons: DaemonsRawData, sequence?: SequenceJSON) {
  if (!sequence) {
    return [];
  }

  const st = HexCodeSequence.fromHex(sequence?.value ?? []);

  return daemons
    .map((daemon) => {
      const dt = HexCodeSequence.fromHex(daemon);
      const start = st.indexOf(dt);

      if (start === -1) {
        return null;
      }

      const end = start + daemon.length;

      return { start, end };
    })
    .filter(Boolean);
}

export const HistoryViewer = ({
  entry,
  customResult,
  sortDaemonsBySequence,
}: HistoryViewerProps) => {
  const [highlight, setHighlight] = useState<Highlight>(null);
  const { rawData: grid } = entry.fragments.find(isGridFragment);
  const { rawData: bufferSize } = entry.fragments.find(
    isBufferSizeFragment
  ) ?? { rawData: entry.settings?.fixedBufferSize ?? BUFFER_SIZE_MIN };
  const { rawData: daemons } = entry.fragments.find(isDaemonsFragment);
  const typesFragment = entry.fragments.find(isTypesFragment);
  const result = customResult || entry.result;
  const hasBreak =
    result?.resolvedSequence.value.length > result?.sequence.value.length;
  const bounds = getDaemonBounds(daemons, result?.resolvedSequence);

  const hasDaemonAttached = useCallback(
    (index: number) => {
      if (hasBreak) {
        return bounds.some(({ start, end }) => index >= start && index < end);
      }

      return true;
    },
    [result]
  );

  return (
    <Row gap scroll={false}>
      <GridViewer
        rawData={grid}
        path={result?.path}
        highlight={highlight}
        hasDaemonAttached={hasDaemonAttached}
      />
      <Col gap flex={0}>
        <BufferSizeViewer
          rawData={bufferSize}
          result={result}
          highlight={highlight}
          hasDaemonAttached={hasDaemonAttached}
          onHighlight={setHighlight}
        />
        <DaemonsViewer
          sortDaemonsBySequence={sortDaemonsBySequence}
          types={typesFragment}
          rawData={daemons}
          result={result}
          onHighlight={setHighlight}
        />
        <TypesFragmentStatus types={typesFragment} />
      </Col>
    </Row>
  );
};
