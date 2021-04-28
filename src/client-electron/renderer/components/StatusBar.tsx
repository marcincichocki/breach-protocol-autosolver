import { WorkerStatus } from '@/core/common';
import { FC } from 'react';
import { MdDone } from 'react-icons/md';
import styled from 'styled-components';

const Spacer = styled.div`
  flex-grow: 1;
`;

const StatusBarItem = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  display: inline-flex;
  padding: 0 8px;
`;

const InteractiveStatusBarItem = styled(StatusBarItem)`
  user-select: none;

  &:hover {
    color: var(--accent);
    cursor: pointer;
  }
`;

const StatusBarStyled = styled.footer`
  height: 40px;
  background: var(--background);
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  text-transform: uppercase;
  padding: 0 12px;
  gap: 0.5rem;
  display: flex;
`;

function renderStatusBarContent(status: WorkerStatus) {
  switch (status) {
    case WorkerStatus.BOOTSTRAP:
      return <StatusBarItem>Loading...</StatusBarItem>;
    case WorkerStatus.READY:
      return <StatusBarItem>Ready</StatusBarItem>;
    case WorkerStatus.WORKING:
      return <StatusBarItem>Working...</StatusBarItem>;
    default:
      return <StatusBarItem>Initializing..</StatusBarItem>;
  }
}

// TODO: add missing props and replace placeholders.
interface StatusBarProps {
  status: WorkerStatus;
}

export const StatusBar: FC<StatusBarProps> = ({ status }) => {
  return (
    <StatusBarStyled>
      <StatusBarItem>
        <MdDone style={{ marginRight: '4px' }} /> placeholder
      </StatusBarItem>
      <InteractiveStatusBarItem>placeholder</InteractiveStatusBarItem>
      {renderStatusBarContent(status)}
      <Spacer />
      <StatusBarItem>placeholder</StatusBarItem>
    </StatusBarStyled>
  );
};
