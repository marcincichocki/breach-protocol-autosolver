import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useIpcEvent, useIpcState } from './common';
import { Navigation, StatusBar } from './components';
import { Calibrate, History } from './pages';
import { StateContext } from './state';

const Main = styled.main`
  flex-grow: 1;
  display: flex;
  overflow-y: auto;
  padding: 0 1rem;
`;

export const App = () => {
  const state = useIpcState();
  const history = useHistory();

  useIpcEvent('ADD_HISTORY_ENTRY', () => history.replace('/history'));

  return (
    <StateContext.Provider value={state}>
      <Navigation />
      <Main>
        <Switch>
          <Route path="/history" component={History} />
          <Route path="/calibrate/:entryId" component={Calibrate} />
        </Switch>
      </Main>
      <StatusBar />
    </StateContext.Provider>
  );
};
