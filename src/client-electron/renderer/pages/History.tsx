import { HistoryEntry } from '@/client-electron/common';
import { FC } from 'react';
import styled from 'styled-components';
import { HistoryViewer } from '../components/HistoryViewer';

const HistoryList = styled.ul`
  overflow-y: auto;
  width: 400px;
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

const HistoryListItem = styled.li`
  border: 1px solid var(--primary);
  background: var(--background);
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--accent);
  flex-shrink: 0;
`;

interface HistoryProps {
  history: HistoryEntry[];
}

export const History: FC<HistoryProps> = ({ history }) => {
  return (
    <HistoryWrapper>
      <HistoryList>
        {history.map((e) => (
          <HistoryListItem key={e.uuid}>{e.uuid}</HistoryListItem>
        ))}
      </HistoryList>
      <div style={{ flexGrow: 1 }}>
        <HistoryViewer entry={history[0]} />
      </div>
    </HistoryWrapper>
  );
};
