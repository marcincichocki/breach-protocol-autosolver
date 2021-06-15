import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';
import { App } from './app';
import { GlobalStyles } from './styles/global';

render(
  <>
    <GlobalStyles />
    <Router>
      <App />
    </Router>
  </>,
  document.getElementById('root')
);
