import type { BreachProtocolTypesFragmentResult } from '@/core';
import { MdWarning } from '@react-icons/all-files/md/MdWarning';
import styled from 'styled-components';
import { Col, Row } from './Flex';

const WarningTitle = styled.h3`
  margin: 0;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
`;

const WarningSubTitle = styled.h4`
  margin: 0;
  font-weight: 600;
  color: var(--primary);
`;

interface TypesFragmentStatusProps {
  types: BreachProtocolTypesFragmentResult;
}

export const TypesFragmentStatus = ({ types }: TypesFragmentStatusProps) => {
  if (!types || types.isValid) return null;

  return (
    <Col>
      <Row style={{ alignItems: 'center' }}>
        <MdWarning size="2rem" color="var(--accent)" />
        <WarningTitle>Warning: unknown daemons</WarningTitle>
      </Row>
      <WarningSubTitle>
        Select correct game language, change threshold or disable this feature.
      </WarningSubTitle>
    </Col>
  );
};
