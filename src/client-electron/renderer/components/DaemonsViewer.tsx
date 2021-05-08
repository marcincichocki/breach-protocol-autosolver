import { DaemonsRawData } from '@/core/common';
import { FC } from 'react';
import styled from 'styled-components';

const DaemonsWrapper = styled.div`
  border: 1px solid var(--primary);
  background: var(--background);
  padding: 10px;
`;

const Daemon = styled.div<{ active: boolean }>`
  color: ${({ active }) => (active ? 'var(--accent)' : '#1a2424')};
`;

interface DaemonsViewerProps {
  daemons: DaemonsRawData;
  activeDaemons: number[];
}

export const DaemonsViewer: FC<DaemonsViewerProps> = ({
  daemons,
  activeDaemons,
}) => {
  return (
    <DaemonsWrapper>
      {daemons.map((d, i) => {
        return (
          <Daemon key={i} active={activeDaemons.includes(i)}>
            {d}
          </Daemon>
        );
      })}
    </DaemonsWrapper>
  );
};
