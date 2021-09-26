import { useEffect } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import {
  asyncRequestDispatcher,
  fromCamelCase,
  transformTimestamp,
  useHistoryEntryFromParam,
} from '../common';
import { Col, NavLink, Row } from '../components';
import { CalibrateFragment } from './CalibrateFragment';

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
    asyncRequestDispatcher({ type: 'TEST_THRESHOLD_INIT', data: fileName });

    return () => {
      asyncRequestDispatcher({ type: 'TEST_THRESHOLD_DISPOSE' });
    };
  }, []);
}

export const Calibrate = () => {
  const entry = useHistoryEntryFromParam();

  if (!entry) return null;

  useContainerInit(entry.fileName);
  const { path } = useRouteMatch<{ entryId: string }>();
  const { time, distance } = transformTimestamp(entry.startedAt);

  return (
    <Col style={{ flexGrow: 1 }}>
      <Row style={{ gap: '2rem' }}>
        {entry.fragments.map((f) => (
          <NavLink key={f.id} to={f.id}>
            {fromCamelCase(f.id)}
          </NavLink>
        ))}
        <span style={{ flexGrow: 1 }} />
        <Heading>
          {time} - {distance}
        </Heading>
      </Row>
      <Route path={`${path}/:fragmentId`}>
        <CalibrateFragment entry={entry} />
      </Route>
    </Col>
  );
};
