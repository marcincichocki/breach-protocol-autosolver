import { FC } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { useHistoryEntryFromParam } from '../common';
import { Col, Row } from '../components/Flex';
import { NavLink } from '../components/Navigation';
import { CalibrateFragment } from './CalibrateFragment';

export const Calibrate: FC = () => {
  const entry = useHistoryEntryFromParam();
  const { path } = useRouteMatch();

  return (
    <Col style={{ flexGrow: 1 }}>
      <Row style={{ gap: '1rem' }}>
        <NavLink to="grid">Grid</NavLink>
        <NavLink to="daemons">Daemons</NavLink>
        <NavLink to="bufferSize">Buffer</NavLink>
      </Row>
      <Route path={`${path}/:fragmentId`}>
        <CalibrateFragment entry={entry} />
      </Route>
    </Col>
  );
};
