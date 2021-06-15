import { render } from 'react-dom';
import { App } from './app';
import { GlobalStyles } from './styles/global';
import { HashRouter as Router } from 'react-router-dom';

render(
  <>
    <GlobalStyles />
    <Router>
      <App />
    </Router>
  </>,
  document.getElementById('root')
);
