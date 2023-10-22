import { RouterProvider } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';
import { useIpcState } from './common';
import { MediaContext, useMedia } from './media';
import { router } from './router';
import { StateContext } from './state';
import { GlobalStyles } from './styles/global';

export const App = () => {
  const state = useIpcState();
  const media = useMedia();

  return (
    <StyleSheetManager disableVendorPrefixes>
      <StateContext.Provider value={state}>
        <MediaContext.Provider value={media}>
          <GlobalStyles />
          <RouterProvider router={router} />
        </MediaContext.Provider>
      </StateContext.Provider>
    </StyleSheetManager>
  );
};
