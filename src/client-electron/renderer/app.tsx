import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { State } from '../common';
import { StatusBar } from './components/StatusBar';

const Main = styled.main`
  flex-grow: 1;
`;

function useIpcEvent<T>(channel: string, initialValue?: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    function handleEvent(e: IpcRendererEvent, value: T) {
      setValue(value);
    }

    ipc.on(channel, handleEvent);

    return () => {
      ipc.removeListener(channel, handleEvent);
    };
  }, []);

  return value;
}

function useStore() {
  const initialState = ipc.sendSync('get-state');
  const state = useIpcEvent<State>('state', initialState);

  return state;
}

export const App = () => {
  const state = useStore();

  return (
    <>
      <Main />
      <StatusBar display={state?.activeDisplay} status={state?.status} />
    </>
  );
};
