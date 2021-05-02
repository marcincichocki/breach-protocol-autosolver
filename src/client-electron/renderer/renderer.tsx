import ReactDOM from 'react-dom';
import { App } from './app';
import { GlobalStyles } from './styles/global';

ReactDOM.render(
  <>
    <GlobalStyles />
    <App />
  </>,
  document.getElementById('root')
);
