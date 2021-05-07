import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { State } from '../common';
import { Navigation } from './components/Navigation';
import { StatusBar } from './components/StatusBar';
import { History } from './pages/History';

const Main = styled.main`
  flex-grow: 1;
  display: flex;
  overflow-y: auto;
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
    <Router>
      <Navigation />
      <Main>
        <Switch>
          <Route path="/history">
            <History history={state.history} />
          </Route>
        </Switch>
      </Main>
      <StatusBar display={state?.activeDisplay} status={state?.status} />
    </Router>
  );
};
