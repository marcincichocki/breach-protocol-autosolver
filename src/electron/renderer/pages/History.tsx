import { BreachProtocolStatus } from '@/electron/common';
import { MdClose } from '@react-icons/all-files/md/MdClose';
import { MdDone } from '@react-icons/all-files/md/MdDone';
import { useContext } from 'react';
import { Navigate, NavLink, Outlet, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { transformTimestamp } from '../common';
import { Col } from '../components';
import { StateContext } from '../state';

const HistoryList = styled.ul`
  overflow-y: auto;
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1 0 250px;
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
  align-items: center;
  color: var(--accent);
  flex-shrink: 0;
  text-decoration: none;
  gap: 1rem;
  text-transform: uppercase;
  font-size: 1.2rem;
  font-weight: 500;
  padding: 0 1rem;

  &.active {
    border-color: var(--accent);
    background: var(--primary-dark);
  }
`;

const HistoryListItemIcon = ({
  status,
  size,
}: {
  status: BreachProtocolStatus;
  size: React.ReactText;
}) => {
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
    <Col gap style={{ margin: 'auto' }}>
      <Heading>No breach protocols solved</Heading>
    </Col>
  );
};

const H1 = styled.h1`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const H2 = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const History = () => {
  const { history } = useContext(StateContext);
  const { entryId = null } = useParams();

  if (!history.length) return <NoHistory />;

  if (!entryId) {
    return <Navigate to={history[0].uuid} replace />;
  }

  return (
    <HistoryWrapper>
      <HistoryList>
        {history.map((e) => {
          const { time, distance } = transformTimestamp(e.startedAt);

          return (
            <li key={e.uuid}>
              <HistoryListItem to={e.uuid}>
                <HistoryListItemIcon size="2rem" status={e.status} />
                <Col>
                  <H1>{distance}</H1>
                  <H2>{time}</H2>
                </Col>
              </HistoryListItem>
            </li>
          );
        })}
      </HistoryList>
      <Col>
        <Outlet />
      </Col>
    </HistoryWrapper>
  );
};
