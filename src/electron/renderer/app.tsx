import { ActionTypes } from '@/electron/common';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { useHistoryRedirect, useIpcState } from './common';
import { Navigation, StatusBar, TitleBar } from './components';
import { Calibrate, Dashboard, History, Settings } from './pages';
import { StateContext } from './state';

const Main = styled.main`
  flex-grow: 1;
  display: flex;
  overflow-y: auto;
  padding: 0 1rem;
`;

export const App = () => {
  const state = useIpcState();

  // Change route when new history entry has been added.
  // TODO: investigate re-renders
  useHistoryRedirect([
    ActionTypes.ADD_HISTORY_ENTRY,
    ActionTypes.REMOVE_HISTORY_ENTRY,
  ]);

  return (
    <StateContext.Provider value={state}>
      <TitleBar />
      <Navigation />
      <Main>
        <Switch>
          <Route path="/history" component={History} />
          <Route path="/calibrate/:entryId" component={Calibrate} />
          <Route path="/settings" component={Settings} />
          <Route path="/" component={Dashboard} />
        </Switch>
      </Main>
      <StatusBar />
    </StateContext.Provider>
  );
};
