import { BreachProtocolStatus, WorkerStatus } from '@/client-electron/common';
import { FC, useContext, useState } from 'react';
import { MdClose, MdDone } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useIpcEvent } from '../common';
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
  opacity: 1;

  &.enter {
    transition: opacity 0.1s ease-out;
  }

  &.leave {
    transition: opacity 0.5s;
    opacity: 0;
  }
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

function useSettingsChangeListener(delay = 2000) {
  const [show, setShow] = useState(false);
  let id: any = null;

  useIpcEvent('SET_SETTINGS', () => {
    if (id) {
      clearTimeout(id);
    }

    setShow(true);

    id = setTimeout(() => {
      setShow(false);
    }, delay);
  });

  return show;
}

export const StatusBar: FC = () => {
  const state = useContext(StateContext);
  const { status } = state.history[0];
  const show = useSettingsChangeListener();
  const history = useHistory();

  function goToDisplaySetting() {
    history.push('/settings?goToDisplay=true');
  }

  return (
    <StatusBarWrapper>
      <StatusBarItem>
        {status === BreachProtocolStatus.Resolved ? <MdDone /> : <MdClose />}
      </StatusBarItem>
      <InteractiveStatusBarItem onClick={goToDisplaySetting}>
        {state.activeDisplay?.id}
      </InteractiveStatusBarItem>
      <StatusBarItem>{getWorkerStatusMessage(state?.status)}</StatusBarItem>
      <Spacer />
      <StatusBarItem className={show ? 'enter' : 'leave'}>Saved</StatusBarItem>
    </StatusBarWrapper>
  );
};
