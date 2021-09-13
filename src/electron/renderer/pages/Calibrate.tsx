import { MdKeyboardBackspace } from '@react-icons/all-files/md/MdKeyboardBackspace';
import { FC, useEffect } from 'react';
import { Link, Route, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import {
  asyncRequestDispatcher,
  fromCamelCase,
  transformTimestamp,
  useHistoryEntryFromParam,
} from '../common';
import { Col, NavLink, Row } from '../components';
import { CalibrateFragment } from './CalibrateFragment';

const Heading = styled.h1<{ active: boolean }>`
  font-size: 2rem;
  text-transform: uppercase;
  font-weight: 500;
  color: ${({ active }) => (active ? 'var(--accent)' : 'var(--primary)')};
  margin: 0;
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

export const Calibrate: FC = () => {
  const entry = useHistoryEntryFromParam();

  if (!entry) return null;

  useContainerInit(entry.fileName);
  const { path, params } = useRouteMatch<{ entryId: string }>();
  const { time, distance } = transformTimestamp(entry.startedAt);

  return (
    <Col style={{ flexGrow: 1 }}>
      <Row style={{ alignItems: 'center', gap: '1rem' }}>
        <Link
          to={`/history/${params.entryId}`}
          style={{ color: 'var(--primary)' }}
        >
          <MdKeyboardBackspace size="32px" />
        </Link>
        <Heading active>
          {time} - {distance}
        </Heading>
      </Row>
      <Row style={{ gap: '2rem' }}>
        {entry.fragments.map((f) => (
          <NavLink key={f.id} to={f.id}>
            {fromCamelCase(f.id)}
          </NavLink>
        ))}
      </Row>
      <Route path={`${path}/:fragmentId`}>
        <CalibrateFragment entry={entry} />
      </Route>
    </Col>
  );
};
