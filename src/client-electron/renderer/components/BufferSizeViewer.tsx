import { BufferSize } from '@/core/common';
import { FC } from 'react';
import styled from 'styled-components';
import { BreachProtocolResultJSON } from '@/core/game';
import { Highlight } from './HistoryViewer';

const BufferSizeWrapper = styled.div`
  border: 1px solid var(--primary);
  background: var(--background);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 10px;
`;

const BufferSizeItem = styled.div<{ active: boolean }>`
  width: 40px;
  height: 40px;
  border: 1px
    ${({ active }) =>
      active ? 'solid var(--accent)' : 'dashed var(--primary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 1rem;
`;

interface BufferSizeViewerProps {
  bufferSize: BufferSize;
  result: BreachProtocolResultJSON;
  onHighlight?: (highlight: Highlight) => void;
}

export const BufferSizeViewer: FC<BufferSizeViewerProps> = ({
  bufferSize,
  result,
  onHighlight,
}) => {
  return (
    <BufferSizeWrapper onMouseLeave={() => onHighlight(null)}>
      {Array.from({ length: bufferSize }, (s, i) => {
        const isActive = i < bufferSize;

        return (
          <BufferSizeItem
            key={i}
            active={isActive}
            onMouseEnter={
              isActive ? () => onHighlight({ from: 0, to: i }) : undefined
            }
          >
            {result.resolvedSequence.value[i]}
          </BufferSizeItem>
        );
      })}
    </BufferSizeWrapper>
  );
};
