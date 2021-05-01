import { WorkerStatus } from '@/core';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { StatusBar } from './components/StatusBar';

ipc.once('worker:ready', () => console.log('worker ready'));

const Main = styled.main`
  flex-grow: 1;
`;

function useIpcEvent<T>(channel: string) {
  const [value, setValue] = useState<T>(null);

  useEffect(() => {
    function handleEvent(event: IpcRendererEvent, value: T) {
      setValue(value);
    }

    ipc.on(channel, handleEvent);

    return () => {
      ipc.removeListener(channel, handleEvent);
    };
  }, []);

  return value;
}

export const App = () => {
  const status = useIpcEvent<WorkerStatus>('worker:status');

  return (
    <>
      <Main />
      <StatusBar status={status} />
    </>
  );
};
