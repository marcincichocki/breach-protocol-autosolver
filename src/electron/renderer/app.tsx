import { ActionTypes } from '@/electron/common';
import { Route, Switch, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useIpcEvent, useIpcState } from './common';
import {
  Navigation,
  ReleaseNotesDialog,
  StatusBar,
  ThirdPartyLicensesDialog,
  TitleBar,
} from './components';
import { Analyze, Calibrate, Dashboard, History, Settings } from './pages';
import { StateContext } from './state';

const Main = styled.main`
  flex-grow: 1;
  display: flex;
  overflow-y: auto;
  padding: 0 1rem;
`;

function useActionRedirect() {
  const history = useHistory();

  useIpcEvent([ActionTypes.SET_ANALYSIS], () => history.replace('/analyze'));
  useIpcEvent(
    [ActionTypes.ADD_HISTORY_ENTRY, ActionTypes.REMOVE_HISTORY_ENTRY],
    () => history.replace('/history')
  );
}

export const App = () => {
  const state = useIpcState();

  useActionRedirect();

  return (
    <StateContext.Provider value={state}>
      <TitleBar />
      <Navigation />
      <Main>
        <Switch>
          <Route path="/history" component={History} />
          <Route path="/calibrate/:entryId" component={Calibrate} />
          <Route path="/settings" component={Settings} />
          <Route path="/analyze" component={Analyze} />
          <Route path="/" component={Dashboard} />
        </Switch>
      </Main>
      <ReleaseNotesDialog />
      <ThirdPartyLicensesDialog />
      <StatusBar />
    </StateContext.Provider>
  );
};
