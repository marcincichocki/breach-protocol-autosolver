import { BreachProtocolResultJSON, BufferSize, BUFFER_SIZE_MAX } from '@/core';
import styled from 'styled-components';
import { Highlight } from './HistoryViewer';

function getBufferSizeWrapperWidth() {
  const square = `${BUFFER_SIZE_MAX} * var(--size)`;
  const gap = `${BUFFER_SIZE_MAX - 1} * var(--gap)`;

  return [square, gap].join(' + ');
}

const BufferSizeWrapper = styled.div`
  --size: 40px;
  --gap: 0.5rem;

  border: 1px solid var(--primary);
  background: var(--background);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: var(--gap);
  width: calc(${getBufferSizeWrapperWidth()});
  overflow-x: auto;
  cursor: default;
`;

const BufferSizeItem = styled.div<{ active: boolean }>`
  width: var(--size);
  height: var(--size);
  flex-shrink: 0;
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
    <BufferSizeWrapper
      onMouseLeave={onHighlight ? () => onHighlight(null) : undefined}
    >
      {Array.from({ length: bufferSize }, (s, i) => {
        const isActive = result && i < result.path.length;

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
            {result?.resolvedSequence.value[i]}
          </BufferSizeItem>
        );
      })}
    </BufferSizeWrapper>
  );
};
