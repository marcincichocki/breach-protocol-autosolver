import type { BreachProtocolTypesFragmentResult } from '@/core';
import { MdWarning } from '@react-icons/all-files/md/MdWarning';
import { useContext } from 'react';
import styled from 'styled-components';
import { RouterExtContext } from '../router-ext';
import { LinkButton } from './Buttons';
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

const WarningLink = styled(LinkButton)`
  color: var(--primary);
  font-weight: 600;
`;

interface TypesFragmentStatusProps {
  types: BreachProtocolTypesFragmentResult;
}

export const TypesFragmentStatus = ({ types }: TypesFragmentStatusProps) => {
  if (!types || types.isValid) return null;

  const { navigateToSetting } = useContext(RouterExtContext);

  return (
    <Col>
      <Row style={{ alignItems: 'center' }}>
        <MdWarning size="2rem" color="var(--accent)" />
        <WarningTitle>Warning: unknown types</WarningTitle>
      </Row>
      <WarningSubTitle>
        Select correct{' '}
        <WarningLink onClick={() => navigateToSetting('gameLang')}>
          game language
        </WarningLink>
        , change{' '}
        <WarningLink onClick={() => navigateToSetting('thresholdTypesAuto')}>
          threshold
        </WarningLink>{' '}
        or{' '}
        <WarningLink onClick={() => navigateToSetting('skipTypesFragment')}>
          disable this feature
        </WarningLink>
        .
      </WarningSubTitle>
    </Col>
  );
};
