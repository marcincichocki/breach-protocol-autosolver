import {
  BreachProtocolStatus,
  HistoryEntry,
  RemoveHistoryEntryAction,
} from '@/electron/common';
import { formatDuration } from 'date-fns';
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

const OpenInExplorer = ({ fileName }: { fileName: string }) => {
  if (!fileName) {
    return null;
  }

  return (
    <LinkButton onClick={() => api.showItemInFolder(fileName)}>
      Open in explorer
    </LinkButton>
  );
};

const SaveSnapshot = ({ entryId }: { entryId: string }) => (
  <LinkButton onClick={() => api.send('main:save-snapshot', entryId)}>
    Save snapshot
  </LinkButton>
);

const RemoveEntry = ({ entryId }: { entryId: string }) => (
  <LinkButton
    onClick={() => api.dispatch(new RemoveHistoryEntryAction(entryId))}
  >
    Remove entry
  </LinkButton>
);

const HistoryDetailsError = ({ entry }: { entry: HistoryEntry }) => (
  <Col
    gap
    style={{
      margin: 'auto',
      alignItems: 'center',
      width: '884px',
    }}
  >
    <Heading2>Error while trying to gather data</Heading2>
    <FlatButton color="accent" as={Link} to={`/calibrate/${entry.uuid}/grid`}>
      Recalibrate
    </FlatButton>
    <OpenInExplorer fileName={entry.fileName} />
    <SaveSnapshot entryId={entry.uuid} />
    <RemoveEntry entryId={entry.uuid} />
  </Col>
);

const DetailText = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
`;

export const HistoryDetails = () => {
  const entry = useHistoryEntryFromParam();

  if (!entry) return null;

  if (entry.status === BreachProtocolStatus.Rejected) {
    return <HistoryDetailsError entry={entry} />;
  }

  const seconds = (entry.finishedAt - entry.startedAt) / 1000;
  const duration = formatDuration({ seconds });

  return (
    <Col gap>
      <HistoryViewer entry={entry} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Col>
          <DetailText>Done in {duration}</DetailText>
        </Col>
        <Col style={{ alignItems: 'flex-end' }}>
          {entry.fileName ? (
            <>
              <OpenInExplorer fileName={entry.fileName} />
              <TextLink to={`/calibrate/${entry.uuid}/grid`}>
                Recalibrate
              </TextLink>
            </>
          ) : (
            <DetailText>Source not available</DetailText>
          )}
          <SaveSnapshot entryId={entry.uuid} />
          <RemoveEntry entryId={entry.uuid} />
        </Col>
      </Row>
    </Col>
  );
};
