import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';
import { App } from './app';
import { GlobalStyles } from './styles/global';

render(
  <StyleSheetManager disableVendorPrefixes>
    <Router>
      <GlobalStyles />
      <App />
    </Router>
  </StyleSheetManager>,
  document.getElementById('root')
);
