import { format, formatDistanceToNowStrict } from 'date-fns';
import { FC } from 'react';
import { MdKeyboardBackspace } from 'react-icons/md';
import { Link, Route, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { fromCamelCase, useHistoryEntryFromParam } from '../common';
import { Col, Row } from '../components/Flex';
import { NavLink } from '../components/Navigation';
import { CalibrateFragment } from './CalibrateFragment';

const Heading = styled.h1<{ active: boolean }>`
  font-size: 2rem;
  text-transform: uppercase;
  font-weight: 500;
  color: ${({ active }) => (active ? 'var(--accent)' : 'var(--primary)')};
  margin: 0;
`;

export const Calibrate: FC = () => {
  const entry = useHistoryEntryFromParam();
  const { path, params } = useRouteMatch<{ entryId: string }>();
  const time = format(entry.startedAt, 'HH:mm:ss');
  const date = formatDistanceToNowStrict(entry.startedAt, { addSuffix: true });

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
          {time} - {date}
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
