import { RouterProvider } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';
import { useIpcState } from './common';
import { router } from './router';
import { StateContext } from './state';
import { GlobalStyles } from './styles/global';

export const App = () => {
  const state = useIpcState();

  return (
    <StyleSheetManager disableVendorPrefixes>
      <StateContext.Provider value={state}>
        <GlobalStyles />
        <RouterProvider router={router} />
      </StateContext.Provider>
    </StyleSheetManager>
  );
};
