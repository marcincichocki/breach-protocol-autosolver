import {
  BreachProtocolResultJSON,
  BreachProtocolTypesFragmentResult,
  DaemonsRawData,
  eng,
} from '@/core';
import { useMemo } from 'react';
import styled from 'styled-components';
import { Col, Row, Spacer } from './Flex';
import { Highlight } from './HistoryViewer';

const DaemonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  cursor: default;
`;

const DaemonType = styled.h3`
  margin: 0;
  font-weight: 600;
  font-size: 1.2rem;
`;

const DaemonSequence = styled(Row)`
  gap: 0.5rem;
`;

const Daemon = styled(Col)<{ active: boolean }>`
  border: 1px solid var(--primary);
  background: var(--background);
  padding: 1rem;
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1;
  color: ${(p) => (p.active ? 'var(--accent)' : 'var(--accent-darker)')};

  > ${DaemonType} {
    color: ${(p) => (p.active ? 'var(--primary)' : 'var(--accent-darker)')};
  }
`;

interface DaemonsViewerProps {
  rawData: DaemonsRawData;
  types?: BreachProtocolTypesFragmentResult;
  result?: BreachProtocolResultJSON;
  sortDaemonsBySequence?: boolean;
  onHighlight?: (highlight: Highlight) => void;
}

function useDaemons(
  rawData: DaemonsRawData,
  result: BreachProtocolResultJSON,
  sort: boolean
) {
  return useMemo(() => {
    const rs = result?.resolvedSequence.value.join('');
    const daemonsWithDetails = rawData.map((raw, index) => {
      const ds = raw.join('');
      const from = result && rs.indexOf(ds) / 2;
      const to = result && from + raw.length - 1;

      return { raw, index, from, to };
    });

    if (sort) {
      return daemonsWithDetails.sort((d1, d2) => {
        if (d2.from < 0) {
          return -1;
        }

        if (d1.from < 0) {
          return 1;
        }

        const start = d1.from - d2.from;
        const end = d1.to - d2.to;

        return start || end;
      });
    }

    return daemonsWithDetails;
  }, [rawData, result, sort]);
}

export const DaemonsViewer = ({
  rawData,
  types,
  result,
  sortDaemonsBySequence,
  onHighlight,
}: DaemonsViewerProps) => {
  const { parts } = result?.resolvedSequence || {};
  const daemons = useDaemons(rawData, result, sortDaemonsBySequence);

  return (
    <DaemonsWrapper
      onMouseLeave={onHighlight ? () => onHighlight(null) : undefined}
    >
      {daemons.map(({ raw, index, from, to }) => {
        const active = result && parts.includes(index);

        return (
          <Daemon
            key={index}
            active={active}
            onMouseEnter={
              active && onHighlight
                ? () => onHighlight({ from, to })
                : undefined
            }
          >
            {types?.isValid && (
              <DaemonType>{eng[types.rawData[index]]}</DaemonType>
            )}
            <DaemonSequence>
              {raw.map((s, i) => (
                <span key={i}>{s}</span>
              ))}
              <Spacer />
              <span>#{index + 1}</span>
            </DaemonSequence>
          </Daemon>
        );
      })}
    </DaemonsWrapper>
  );
};
