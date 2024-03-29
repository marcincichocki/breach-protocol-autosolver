import { ActionTypes, UpdateStatus, WorkerStatus } from '@/electron/common';
import { ProgressInfo } from 'electron-updater';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { getDisplayName, getPatchName, useIpcEvent } from '../common';
import { RouterExtContext } from '../router-ext';
import { StateContext } from '../state';
import { Spacer } from './Flex';

const StatusBarItem = styled.div<{ warn?: boolean }>`
  height: 100%;
  align-items: center;
  display: inline-flex;
  padding: 0 8px;
  opacity: 1;
  background: ${(p) => p.warn && 'var(--primary)'};

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
  flex-shrink: 0;
`;

function getWorkerStatusMessage(status: WorkerStatus) {
  switch (status) {
    case WorkerStatus.Disconnected:
      return 'Disconnected';
    case WorkerStatus.Disabled:
      return 'Disabled';
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

  useIpcEvent([ActionTypes.UPDATE_SETTINGS], ({ meta }: any) => {
    if (meta?.notify === false) {
      return;
    }

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

function useDownloadProgress() {
  const [progress, setProgress] = useState(0);

  useIpcEvent(['renderer:download-progress'], (info: ProgressInfo) => {
    setProgress(info.percent);
  });

  return progress;
}

function useShowUpdateStatus(status: UpdateStatus, delay = 3000) {
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  let id: any = null;

  useEffect(() => {
    clearTimeout(id);
    setShowUpdateStatus(true);

    id = setTimeout(() => {
      setShowUpdateStatus(false);
    }, delay);
  }, [status]);

  return showUpdateStatus;
}

const updateStatusMessage = {
  [UpdateStatus.Error]: 'Error occurred',
  [UpdateStatus.NetworkError]: 'Offline',
  [UpdateStatus.CheckingForUpdate]: 'Checking for updates..',
  [UpdateStatus.UpdateNotAvailable]: 'Up to date',
  [UpdateStatus.UpdateAvailable]: 'Update available',
  [UpdateStatus.Downloading]: 'Downloading..',
  [UpdateStatus.UpdateDownloaded]: 'Update downloaded',
};

const DownloadProgressBar = styled.div<{ value: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--accent);
  height: 2px;
  width: ${(p) => p.value}%;
  transition: width 0.5s;
`;

export const StatusBar = () => {
  const {
    displays,
    status,
    updateStatus,
    settings: { activeDisplayId, patch },
  } = useContext(StateContext);
  const { navigateToSetting } = useContext(RouterExtContext);
  const show = useSettingsChangeListener();
  const showUpdateStatus = useShowUpdateStatus(updateStatus);
  const progress = useDownloadProgress();
  const activeDisplay = displays.find((d) => d.id === activeDisplayId);
  const isWorkerDetatch =
    status === WorkerStatus.Disabled || status === WorkerStatus.Disconnected;

  return (
    <StatusBarWrapper>
      <StatusBarItem>{VERSION}</StatusBarItem>
      <InteractiveStatusBarItem onClick={() => navigateToSetting('patch')}>
        patch: {getPatchName(patch)}
      </InteractiveStatusBarItem>
      <InteractiveStatusBarItem
        onClick={() => navigateToSetting('activeDisplayId')}
      >
        {activeDisplay ? getDisplayName(activeDisplay) : 'Loading...'}
      </InteractiveStatusBarItem>
      <StatusBarItem warn={isWorkerDetatch}>
        {getWorkerStatusMessage(status)}
      </StatusBarItem>
      <Spacer />
      <StatusBarItem className={show ? 'enter' : 'leave'}>Saved</StatusBarItem>
      {showUpdateStatus && (
        <StatusBarItem>{updateStatusMessage[updateStatus]}</StatusBarItem>
      )}
      <DownloadProgressBar value={progress} />
    </StatusBarWrapper>
  );
};
