import { BreachProtocolResultJSON, DaemonsRawData } from '@/core';
import styled from 'styled-components';
import { Spacer } from './Flex';
import { Highlight } from './HistoryViewer';

const DaemonsWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
`;

const Daemon = styled.div<{ active: boolean }>`
  border: 1px solid var(--primary);
  background: var(--background);
  display: inline-flex;
  gap: 0.5rem;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: 500;
  color: ${({ active }) => (active ? 'var(--accent)' : 'var(--accent-darker)')};
`;

interface DaemonsViewerProps {
  daemons: DaemonsRawData;
  result?: BreachProtocolResultJSON;
  onHighlight?: (highlight: Highlight) => void;
}

export const DaemonsViewer = ({
  daemons,
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
            {d.map((s, j) => (
              <span key={j}>{s}</span>
            ))}
            <Spacer />
            <span>#{i + 1}</span>
          </Daemon>
        );
      })}
    </DaemonsWrapper>
  );
};
