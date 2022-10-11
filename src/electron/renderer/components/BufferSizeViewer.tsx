import { BreachProtocolResultJSON, BUFFER_SIZE_MAX } from '@/core';
import styled from 'styled-components';
import { Highlight } from './HistoryViewer';
import { getSquareColor, Square } from './Square';

function getBufferSizeWrapperWidth() {
  const square = `${BUFFER_SIZE_MAX} * var(--square)`;
  const gap = `${BUFFER_SIZE_MAX - 1} * var(--gap)`;

  return [square, gap].join(' + ');
}

const BufferSizeWrapper = styled.div`
  --square: 40px;
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
  flex-shrink: 0;
`;

const BufferSizeItem = styled(Square)`
  border-width: 1px;
  border-style: ${({ active }) => (active ? 'solid' : 'dashed')};
  border-color: ${getSquareColor('var(--accent)', 'var(--primary)')};
  color: ${getSquareColor('var(--background)')};
  background: ${({ highlight }) =>
    highlight ? 'var(--accent)' : 'var(--background)'};
`;

interface BufferSizeViewerProps {
  bufferSize: number;
  result?: BreachProtocolResultJSON;
  highlight: Highlight;
  hasDaemonAttached: (index: number) => boolean;
  onHighlight?: (highlight: Highlight) => void;
}

export const BufferSizeViewer = ({
  bufferSize,
  result,
  highlight,
  hasDaemonAttached,
  onHighlight,
}: BufferSizeViewerProps) => {
  return (
    <BufferSizeWrapper
      onMouseLeave={onHighlight ? () => onHighlight(null) : undefined}
    >
      {Array.from({ length: bufferSize }, (s, i) => {
        const isActive = result && i < result.path.length;
        const hasDaemon = isActive && hasDaemonAttached(i);
        const hasHighlight =
          isActive && i >= highlight?.from && i <= highlight?.to;

        return (
          <BufferSizeItem
            key={i}
            active={isActive}
            highlight={hasHighlight}
            hasDaemon={hasDaemon}
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
