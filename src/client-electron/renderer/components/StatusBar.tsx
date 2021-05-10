import { BreachProtocolStatus, WorkerStatus } from '@/client-electron/common';
import { FC, useContext } from 'react';
import { MdClose, MdDone } from 'react-icons/md';
import styled from 'styled-components';
import { StateContext } from '../state';

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

const StatusBarWrapper = styled.footer`
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

function getWorkerStatusMessage(status: WorkerStatus) {
  switch (status) {
    case WorkerStatus.Bootstrap:
      return 'Loading...';
    case WorkerStatus.Ready:
      return 'Ready';
    case WorkerStatus.Working:
      return 'Working...';
    default:
      return 'Initializing...';
  }
}

export const StatusBar: FC = () => {
  const state = useContext(StateContext);
  const { status } = state.history[0];

  return (
    <StatusBarWrapper>
      <StatusBarItem>
        {status === BreachProtocolStatus.Resolved ? <MdDone /> : <MdClose />}
      </StatusBarItem>
      <InteractiveStatusBarItem>
        {state.activeDisplay?.id}
      </InteractiveStatusBarItem>
      <StatusBarItem>{getWorkerStatusMessage(state?.status)}</StatusBarItem>
      <Spacer />
      <StatusBarItem>placeholder</StatusBarItem>
    </StatusBarWrapper>
  );
};
