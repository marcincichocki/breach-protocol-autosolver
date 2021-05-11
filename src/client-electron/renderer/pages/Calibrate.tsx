import { FC } from 'react';
import { NavLink, Route, useRouteMatch } from 'react-router-dom';
import { useHistoryEntryFromParam } from '../common';
import { CalibrateFragment } from './CalibrateFragment';

export const Calibrate: FC = () => {
  const entry = useHistoryEntryFromParam();
  const { path } = useRouteMatch();

  return (
    <>
      <NavLink to="grid">Grid</NavLink>
      <NavLink to="daemons">Daemons</NavLink>
      <NavLink to="bufferSize">Buffer</NavLink>

      <Route path={`${path}/:fragmentId`}>
        <CalibrateFragment entry={entry} />
      </Route>
    </>
  );
};
