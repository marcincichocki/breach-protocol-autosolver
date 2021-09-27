import {
  BreachProtocolFragmentResults,
  BreachProtocolFragmentStatus,
} from '@/core';
import styled from 'styled-components';
import { Col } from './Flex';

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

// prettier-ignore
const RawDataStatusMessage = styled.span<{ status: BreachProtocolFragmentStatus }>`
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  color: ${(p) =>
    p.status === BreachProtocolFragmentStatus.Valid
      ? 'var(--accent)'
      : 'var(--primary)'};
  font-size: 1.5rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const statusMessages = {
  [BreachProtocolFragmentStatus.InvalidSize]: 'Invalid size',
  [BreachProtocolFragmentStatus.InvalidSymbols]: 'Invalid codes',
  [BreachProtocolFragmentStatus.Valid]: 'Valid',
};

type RawDataPreviewProps = Pick<
  BreachProtocolFragmentResults[number],
  'status' | 'rawData'
>;

export const RawDataPreview = ({ status, rawData }: RawDataPreviewProps) => (
  <Col style={{ position: 'relative', overflowY: 'auto', flex: 1 }}>
    <RawDataPreviewWrapper>
      {JSON.stringify(rawData, null, 2)}
    </RawDataPreviewWrapper>
    <RawDataStatusMessage status={status}>
      {statusMessages[status]}
    </RawDataStatusMessage>
  </Col>
);
