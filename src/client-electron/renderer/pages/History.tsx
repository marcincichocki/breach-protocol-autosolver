import toNow from 'date-fns/formatDistanceToNow';
import { FC, useContext } from 'react';
import { NavLink, Route, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { Col } from '../components/Flex';
import { StateContext } from '../state';
import { HistoryDetails } from './HistoryDetails';

const HistoryList = styled.ul`
  overflow-y: auto;
  width: 300px;
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
  padding: 0 1rem;
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

  &.active {
    border-color: var(--accent);
    background: var(--primary-dark);
  }
`;

export const History: FC = () => {
  const { history } = useContext(StateContext);
  const { path } = useRouteMatch();

  return (
    <HistoryWrapper>
      <HistoryList>
        {history.map((e) => (
          <li key={e.uuid}>
            <HistoryListItem to={`${path}/${e.uuid}`}>
              {toNow(e.startedAt, { addSuffix: true })}
            </HistoryListItem>
          </li>
        ))}
      </HistoryList>
      <Col style={{ flexGrow: 1 }}>
        <Route path={`${path}/:entryId`}>
          <HistoryDetails />
        </Route>
      </Col>
    </HistoryWrapper>
  );
};
