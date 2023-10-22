import { BreachProtocolResultJSON, BUFFER_SIZE_MAX } from '@/core';
import styled from 'styled-components';
import { Highlight } from './HistoryViewer';
import { getSquareColor, Square } from './Square';

function getBufferSizeWrapperWidth() {
  // TODO: Use prop instead of constant as BUFFER_SIZE_MAX depends on patch.
  const square = `${BUFFER_SIZE_MAX - 1} * var(--square)`;
  const gap = `${BUFFER_SIZE_MAX - 2} * var(--gap)`;

  return [square, gap].join(' + ');
}

const BufferSizeWrapper = styled.div`
  --square: 36px;
  --gap: 0.5rem;

  @media (min-width: 1280px) {
    --square: 40px;
  }

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
  rawData: number;
  result?: BreachProtocolResultJSON;
  highlight: Highlight;
  hasDaemonAttached: (index: number) => boolean;
  onHighlight?: (highlight: Highlight) => void;
}

export const BufferSizeViewer = ({
  rawData,
  result,
  highlight,
  hasDaemonAttached,
  onHighlight,
}: BufferSizeViewerProps) => {
  return (
    <BufferSizeWrapper
      onMouseLeave={onHighlight ? () => onHighlight(null) : undefined}
    >
      {Array.from({ length: rawData }, (s, i) => {
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
