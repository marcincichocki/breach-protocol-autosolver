import { ActionTypes, AppSettings } from '@/electron/common';
import { useEffect } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useIpcEvent, useIpcState } from './common';
import {
  AnalyzeDropZone,
  Navigation,
  ReleaseNotesDialog,
  StatusBar,
  ThirdPartyLicensesDialog,
  TitleBar,
} from './components';
import { Analyze, Calibrate, Dashboard, History, Settings } from './pages';
import { StateContext } from './state';
import { RouterExtContext } from './router-ext';

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

function useHashScroll() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const ref = document.querySelector(location.hash);

      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);
}

export const App = () => {
  const history = useHistory();
  const state = useIpcState();

  useActionRedirect();
  useHashScroll();

  function navigateToSetting(id: keyof AppSettings) {
    history.push(`/settings#${id}`);
  }

  return (
    <StateContext.Provider value={state}>
      <RouterExtContext.Provider value={{ navigateToSetting }}>
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
        <AnalyzeDropZone />
        <StatusBar />
      </RouterExtContext.Provider>
    </StateContext.Provider>
  );
};
