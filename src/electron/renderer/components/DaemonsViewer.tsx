import {
  BreachProtocolResultJSON,
  BreachProtocolTypesFragmentResult,
  DaemonsRawData,
  eng,
} from '@/core';
import styled from 'styled-components';
import { Col, Row, Spacer } from './Flex';
import { Highlight } from './HistoryViewer';

const DaemonsWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
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
  daemons: DaemonsRawData;
  types?: BreachProtocolTypesFragmentResult;
  result?: BreachProtocolResultJSON;
  onHighlight?: (highlight: Highlight) => void;
}

export const DaemonsViewer = ({
  daemons,
  types,
  result,
  onHighlight,
}: DaemonsViewerProps) => {
  const { parts } = result?.resolvedSequence || {};
  const s = result?.resolvedSequence.value.join('');

  return (
    <DaemonsWrapper>
      {daemons.map((d, i) => {
        const ds = d.join('');
        const from = result && s.indexOf(ds) / 2;
        const to = result && from + d.length - 1;
        const active = result && parts.includes(i);

        return (
          <Daemon
            key={i}
            active={active}
            onMouseEnter={
              active && onHighlight
                ? () => onHighlight({ from, to })
                : undefined
            }
            onMouseLeave={onHighlight ? () => onHighlight(null) : undefined}
          >
            {types?.isValid && <DaemonType>{eng[types.rawData[i]]}</DaemonType>}
            <DaemonSequence>
              {d.map((s, j) => (
                <span key={j}>{s}</span>
              ))}
              <Spacer />
              <span>#{i + 1}</span>
            </DaemonSequence>
          </Daemon>
        );
      })}
    </DaemonsWrapper>
  );
};
