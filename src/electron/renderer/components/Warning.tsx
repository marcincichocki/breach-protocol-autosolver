import { AppSettings } from '@/electron/common';
import { MdWarning } from '@react-icons/all-files/md/MdWarning';
import { PropsWithChildren, ReactElement, useContext } from 'react';
import styled from 'styled-components';
import { RouterExtContext } from '../router-ext';
import { LinkButton } from './Buttons';
import { Col, Row } from './Flex';

const Title = styled.h3`
  margin: 0;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
`;

const Body = styled.h4`
  margin: 0;
  font-weight: 600;
  color: var(--primary);
`;

const Link = styled(
  ({
    setting,
    children,
  }: PropsWithChildren<{ setting: keyof AppSettings }>) => {
    const { navigateToSetting } = useContext(RouterExtContext);

    return (
      <LinkButton onClick={() => navigateToSetting(setting)}>
        {children}
      </LinkButton>
    );
  }
)`
  color: var(--primary);
  font-weight: 600;
`;

interface WarningProps {
  title: ReactElement;
  body: ReactElement;
  className?: string;
}

export const Warning = ({ title, body, className }: WarningProps) => {
  return (
    <Col className={className}>
      <Row style={{ alignItems: 'center' }}>
        <MdWarning size="2rem" color="var(--accent)" />
        {title}
      </Row>
      {body}
    </Col>
  );
};

Warning.Title = Title;
Warning.Body = Body;
Warning.Link = Link;
