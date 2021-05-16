import { BufferSize } from '@/core/common';
import { FC } from 'react';
import styled from 'styled-components';
import { BreachProtocolResultJSON } from '@/core/game';
import { Highlight } from './HistoryViewer';

// TODO: extract Square and use it here.
const BufferSizeWrapper = styled.div`
  border: 1px solid var(--primary);
  background: var(--background);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 16px;
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
  font-size: 24px;
  font-weight: 500;
  box-sizing: border-box;
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
        const isActive = i < result.path.length;

        return (
          <BufferSizeItem
            key={i}
            active={isActive}
            onMouseEnter={
              onHighlight
                ? () => onHighlight(isActive ? { from: 0, to: i } : null)
                : undefined
            }
          >
            {result.resolvedSequence.value[i]}
          </BufferSizeItem>
        );
      })}
    </BufferSizeWrapper>
  );
};
