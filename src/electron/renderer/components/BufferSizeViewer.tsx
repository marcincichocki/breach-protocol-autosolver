import { BreachProtocolResultJSON, BufferSize } from '@/core';
import styled from 'styled-components';
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
  result?: BreachProtocolResultJSON;
  onHighlight?: (highlight: Highlight) => void;
}

export const BufferSizeViewer = ({
  bufferSize,
  result,
  onHighlight,
}: BufferSizeViewerProps) => {
  return (
    <BufferSizeWrapper onMouseLeave={onHighlight && (() => onHighlight(null))}>
      {Array.from({ length: bufferSize }, (s, i) => {
        const isActive = result && i < result.path.length;

        return (
          <BufferSizeItem
            key={i}
            active={isActive}
            onMouseEnter={
              onHighlight &&
              (() => onHighlight(isActive ? { from: 0, to: i } : null))
            }
          >
            {result?.resolvedSequence.value[i]}
          </BufferSizeItem>
        );
      })}
    </BufferSizeWrapper>
  );
};
