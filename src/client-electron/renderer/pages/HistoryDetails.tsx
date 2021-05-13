import { BreachProtocolStatus, HistoryEntry } from '@/client-electron/common';
import { differenceInMilliseconds as diff, formatDuration } from 'date-fns';
import { shell } from 'electron';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useHistoryEntryFromParam } from '../common';
import { FlatButton, LinkButton } from '../components/Buttons';
import { Col, Row } from '../components/Flex';
import { HistoryViewer } from '../components/HistoryViewer';

const Heading2 = styled.h2`
  color: var(--primary);
  font-size: 3rem;
  text-transform: uppercase;
  font-weight: 500;
  margin: auto;
`;

const TextLink = styled(Link)`
  font-size: 1rem;
  color: var(--accent);
`;

const OpenInExplorer: FC<{ fileName: string }> = ({ fileName, children }) => {
  if (!fileName) {
    return null;
  }

  return (
    <LinkButton onClick={() => shell.showItemInFolder(fileName)}>
      {children}
    </LinkButton>
  );
};

const HistoryDetailsError: FC<{ entry: HistoryEntry }> = ({ entry }) => (
  <Col style={{ margin: 'auto', alignItems: 'center', gap: '1rem' }}>
    <Heading2>Error while trying to gather data</Heading2>
    <FlatButton color="accent" as={Link} to={`/calibrate/${entry.uuid}/grid`}>
      Re-calibrate
    </FlatButton>
    <OpenInExplorer fileName={entry.fileName}>Show source</OpenInExplorer>
  </Col>
);

export const HistoryDetails: FC = () => {
  const entry = useHistoryEntryFromParam();

  if (entry.status === BreachProtocolStatus.Rejected) {
    return <HistoryDetailsError entry={entry} />;
  }

  const seconds = diff(entry.finishedAt, entry.startedAt) / 1000;
  const duration = formatDuration({ seconds });

  return (
    <Col style={{ gap: '1rem' }}>
      <HistoryViewer entry={entry} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Col>Done in {duration}</Col>
        {entry.fileName && (
          <Col>
            <OpenInExplorer fileName={entry.fileName}>
              Show source
            </OpenInExplorer>
            <TextLink to={`/calibrate/${entry.uuid}/grid`}>
              Re-calibrate
            </TextLink>
          </Col>
        )}
      </Row>
    </Col>
  );
};
