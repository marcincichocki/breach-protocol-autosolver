import { BreachProtocolResultJSON } from '@/core';
import { DaemonsRawData } from '@/core/common';
import { FC } from 'react';
import styled from 'styled-components';
import { Highlight } from './HistoryViewer';

const DaemonsWrapper = styled.div`
  border: 1px solid var(--primary);
  background: var(--background);
  padding: 10px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Daemon = styled.div<{ active: boolean }>`
  display: inline-flex;
  gap: 1rem;
  font-size: 2rem;
  color: ${({ active }) => (active ? 'var(--accent)' : '#1a2424')};
`;

interface DaemonsViewerProps {
  daemons: DaemonsRawData;
  result: BreachProtocolResultJSON;
  onHighlight?: (highlight: Highlight) => void;
}

export const DaemonsViewer: FC<DaemonsViewerProps> = ({
  daemons,
  result,
  onHighlight,
}) => {
  const { parts } = result.resolvedSequence;
  const s = result.resolvedSequence.value.join('');

  return (
    <DaemonsWrapper>
      {daemons.map((d, i) => {
        const ds = d.join('');
        const from = s.indexOf(ds) / 2;
        const to = from + d.length - 1;
        const active = parts.includes(i);

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
          </Daemon>
        );
      })}
    </DaemonsWrapper>
  );
};
