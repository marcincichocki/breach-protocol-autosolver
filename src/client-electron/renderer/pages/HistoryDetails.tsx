import { BreachProtocolStatus, HistoryEntry } from '@/client-electron/common';
import { differenceInMilliseconds as diff, formatDuration } from 'date-fns';
import { ipcRenderer as ipc, shell } from 'electron';
import { FC, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useHistoryEntryFromParam } from '../common';
import { Col, FlatButton, HistoryViewer, LinkButton, Row } from '../components';

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

const SaveSnapshot = ({
  entryId,
  children,
}: PropsWithChildren<{ entryId: string }>) => {
  return (
    <LinkButton onClick={() => ipc.send('renderer:save-snapshot', entryId)}>
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
    <SaveSnapshot entryId={entry.uuid}>Save snapshot</SaveSnapshot>
  </Col>
);

const DetailText = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
`;

export const HistoryDetails: FC = () => {
  const entry = useHistoryEntryFromParam();

  if (!entry) return null;

  if (entry.status === BreachProtocolStatus.Rejected) {
    return <HistoryDetailsError entry={entry} />;
  }

  const seconds = diff(entry.finishedAt, entry.startedAt) / 1000;
  const duration = formatDuration({ seconds });

  return (
    <Col style={{ gap: '1rem' }}>
      <HistoryViewer entry={entry} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Col>
          <DetailText>Done in {duration}</DetailText>
        </Col>
        <Col style={{ alignItems: 'flex-end' }}>
          {entry.fileName ? (
            <>
              <OpenInExplorer fileName={entry.fileName}>
                Show source
              </OpenInExplorer>
              <TextLink to={`/calibrate/${entry.uuid}/grid`}>
                Re-calibrate
              </TextLink>
            </>
          ) : (
            <DetailText>Source not available</DetailText>
          )}
          <SaveSnapshot entryId={entry.uuid}>Save snapshot</SaveSnapshot>
        </Col>
      </Row>
    </Col>
  );
};
