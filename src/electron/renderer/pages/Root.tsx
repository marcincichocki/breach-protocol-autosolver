import { ActionTypes, AppSettings, State } from '@/electron/common';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getFirstHistoryEntryPath, useIpcEvent } from '../common';
import {
  AnalyzeDropZone,
  Navigation,
  ReleaseNotesDialog,
  StatusBar,
  ThirdPartyLicensesDialog,
  TitleBar,
} from '../components';
import { RouterExtContext } from '../router-ext';

const Main = styled.main`
  flex-grow: 1;
  display: flex;
  overflow-y: auto;
  padding: 0 1rem;
`;

function useActionRedirect() {
  const navigate = useNavigate();

  useIpcEvent([ActionTypes.SET_ANALYSIS], () =>
    navigate('/analyze/select', { replace: true })
  );
  useIpcEvent<{ payload: State }>(
    [ActionTypes.ADD_HISTORY_ENTRY, ActionTypes.REMOVE_HISTORY_ENTRY],
    ({ payload }) => {
      const path = getFirstHistoryEntryPath(payload.history);

      navigate(path, { replace: true });
    }
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

export const Root = () => {
  const navigate = useNavigate();

  useActionRedirect();
  useHashScroll();

  function navigateToSetting(id: keyof AppSettings) {
    navigate(`/settings#${id}`);
  }

  return (
    <RouterExtContext.Provider value={{ navigateToSetting }}>
      <TitleBar />
      <Navigation />
      <Main>
        <Outlet />
      </Main>
      <ReleaseNotesDialog />
      <ThirdPartyLicensesDialog />
      <AnalyzeDropZone />
      <StatusBar />
    </RouterExtContext.Provider>
  );
};
