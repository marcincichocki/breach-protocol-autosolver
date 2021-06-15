import { FC } from 'react';
import styled from 'styled-components';

const RawDataPreviewWrapper = styled.pre`
  border: 1px solid var(--primary);
  background: var(--background);
  color: var(--accent);
  padding: 1rem;
  font-family: Rajdhani;
  font-weight: 500;
  font-size: 1.2rem;
  overflow-y: auto;
  margin: 0;
  flex-grow: 1;
`;

export const RawDataPreview: FC<{
  rawData: any;
}> = ({ rawData }) => {
  return (
    <RawDataPreviewWrapper>
      {JSON.stringify(rawData, null, 2)}
    </RawDataPreviewWrapper>
  );
};
