import { BreachProtocolStatus, HistoryEntry } from '@/client-electron/common';
import { differenceInMilliseconds as diff, formatDuration } from 'date-fns';
import { shell } from 'electron';
import { FC, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FlatButton, LinkButton } from '../components/Buttons';
import { Col, Row } from '../components/Flex';
import { HistoryViewer } from '../components/HistoryViewer';
import { StateContext } from '../state';

interface HistoryDetailsParams {
  entryId: string;
}

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
    <FlatButton color="accent" as={Link} to={`/calibrate/${entry.uuid}`}>
      Re-calibrate
    </FlatButton>
    <OpenInExplorer fileName={entry.fileName}>Show source</OpenInExplorer>
  </Col>
);

export const HistoryDetails: FC = () => {
  const { history } = useContext(StateContext);
  const { entryId } = useParams<HistoryDetailsParams>();
  const entry = history.find((e) => e.uuid === entryId);

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
        <Col>
          <OpenInExplorer fileName={entry.fileName}>Show source</OpenInExplorer>
          <TextLink to={`/calibrate/${entry.uuid}`}>Re-calibrate</TextLink>
        </Col>
      </Row>
    </Col>
  );
};
