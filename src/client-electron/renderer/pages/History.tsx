import { BreachProtocolStatus } from '@/client-electron/common';
import { FC, useContext } from 'react';
import { MdClose, MdDone } from 'react-icons/md';
import {
  NavLink,
  Redirect,
  Route,
  Switch,
  useRouteMatch,
} from 'react-router-dom';
import styled from 'styled-components';
import { getDistance } from '../common';
import { Col } from '../components';
import { StateContext } from '../state';
import { HistoryDetails } from './HistoryDetails';

const HistoryList = styled.ul`
  overflow-y: auto;
  width: 250px;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HistoryWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  gap: 1rem;
`;

const HistoryListItem = styled(NavLink)`
  border: 1px solid var(--primary);
  background: var(--background);
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--accent);
  flex-shrink: 0;
  text-decoration: none;
  gap: 1rem;
  text-transform: uppercase;
  font-size: 1.2rem;
  font-weight: 500;

  &.active {
    border-color: var(--accent);
    background: var(--primary-dark);
  }
`;

const HistoryListItemIcon: FC<{
  status: BreachProtocolStatus;
  size: React.ReactText;
}> = ({ status, size }) => {
  if (status === BreachProtocolStatus.Resolved) {
    return <MdDone size="2rem" color="var(--success)" />;
  }

  return <MdClose size={size} color="var(--primary)" />;
};

const Heading = styled.h2`
  color: var(--primary);
  font-size: 3rem;
  text-transform: uppercase;
  font-weight: 500;
`;

const NoHistory = () => {
  return (
    <Col style={{ margin: 'auto', gap: '1rem' }}>
      <Heading>No breach protocols solved</Heading>
    </Col>
  );
};

export const History: FC = () => {
  const { history } = useContext(StateContext);

  if (!history.length) return <NoHistory />;

  const { path } = useRouteMatch();

  return (
    <HistoryWrapper>
      <HistoryList>
        {history.map((e) => (
          <li key={e.uuid}>
            <HistoryListItem to={`${path}/${e.uuid}`}>
              <HistoryListItemIcon size="2rem" status={e.status} />
              {getDistance(e.startedAt)}
            </HistoryListItem>
          </li>
        ))}
      </HistoryList>
      <Col style={{ flexGrow: 1 }}>
        <Switch>
          <Route path={`${path}/:entryId`} component={HistoryDetails} />
          <Redirect to={`/history/${history[0].uuid}`} />
        </Switch>
      </Col>
    </HistoryWrapper>
  );
};
