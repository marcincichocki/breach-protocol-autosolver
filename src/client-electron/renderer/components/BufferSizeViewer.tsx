import { BufferSize } from '@/core/common';
import { FC } from 'react';
import styled from 'styled-components';
import { BreachProtocolResultJSON } from '@/core/game';

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
}

export const BufferSizeViewer: FC<BufferSizeViewerProps> = ({
  bufferSize,
  result,
}) => {
  return (
    <BufferSizeWrapper>
      {Array.from({ length: bufferSize }, (s, i) => (
        <BufferSizeItem key={i} active={i < bufferSize}>
          {result.resolvedSequence.value[i]}
        </BufferSizeItem>
      ))}
    </BufferSizeWrapper>
  );
};
