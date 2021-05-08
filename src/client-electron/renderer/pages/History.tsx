import { BreachProtocolStatus, HistoryEntry } from '@/client-electron/common';
import { FC, useState } from 'react';
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
  const [entry, setEntry] = useState(history[0]);

  return (
    <HistoryWrapper>
      <HistoryList>
        {history.map((e) => (
          <HistoryListItem onClick={() => setEntry(e)} key={e.uuid}>
            {e.uuid}
          </HistoryListItem>
        ))}
      </HistoryList>
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        {entry.status === BreachProtocolStatus.Rejected && <h1>Error</h1>}
        <HistoryViewer entry={entry} />
      </div>
    </HistoryWrapper>
  );
};
