import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import {
  dispatchAsyncRequest,
  fromCamelCase,
  transformTimestamp,
  useHistoryEntryFromParam,
} from '../common';
import { Col, NavLink, Row, Spacer } from '../components';

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

  useContainerInit(entry.fileName);
  const { time, distance } = transformTimestamp(entry.startedAt);

  return (
    <Col grow>
      <Row style={{ gap: '2rem' }}>
        {entry.fragments.map((f) => (
          <NavLink key={f.id} to={f.id}>
            {fromCamelCase(f.id)}
          </NavLink>
        ))}
        <Spacer />
        <Heading>
          {time} - {distance}
        </Heading>
      </Row>
      <Outlet context={entry} />
    </Col>
  );
};
