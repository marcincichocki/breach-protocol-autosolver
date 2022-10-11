import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import {
  dispatchAsyncRequest,
  fromCamelCase,
  transformTimestamp,
  useHistoryEntryFromParam,
} from '../common';
import { Col, Row } from '../components';
import { useNavigation } from '../router-ext';

const Heading = styled.h1`
  font-size: 2rem;
  text-transform: uppercase;
  font-weight: 500;
  color: var(--accent);
  margin: 0;
  width: 600px;
`;

function useContainerInit(fileName: string) {
  useEffect(() => {
    // FIXME: tiny race condition. Disable button until fragments are ready.
    dispatchAsyncRequest({ type: 'TEST_THRESHOLD_INIT', data: fileName });

    return () => {
      dispatchAsyncRequest({ type: 'TEST_THRESHOLD_DISPOSE' });
    };
  }, []);
}

export const Calibrate = () => {
  const entry = useHistoryEntryFromParam();

  if (!entry) return null;

  const items = entry.fragments.map(({ id }) => ({
    to: `/calibrate/${entry.uuid}/${id}`,
    label: fromCamelCase(id),
  }));
  useNavigation({ items, from: `/history/${entry.uuid}` });
  useContainerInit(entry.fileName);
  const { time, distance } = transformTimestamp(entry.startedAt);

  return (
    <Col grow>
      <Row style={{ gap: '2rem' }}>
        <Heading>
          {time} - {distance}
        </Heading>
      </Row>
      <Outlet context={entry} />
    </Col>
  );
};
