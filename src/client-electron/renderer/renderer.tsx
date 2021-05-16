import ReactDOM from 'react-dom';
import { App } from './app';
import { GlobalStyles } from './styles/global';
import { HashRouter as Router } from 'react-router-dom';

ReactDOM.render(
  <>
    <GlobalStyles />
    <Router>
      <App />
    </Router>
  </>,
  document.getElementById('root')
);
