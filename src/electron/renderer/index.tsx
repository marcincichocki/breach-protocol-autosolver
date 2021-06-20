import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';
import { App } from './app';
import { GlobalStyles } from './styles/global';

function createRootElement() {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);

  return root;
}

render(
  <StyleSheetManager disableVendorPrefixes>
    <Router>
      <GlobalStyles />
      <App />
    </Router>
  </StyleSheetManager>,
  createRootElement()
);
