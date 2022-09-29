import { render } from 'react-dom';
import { App } from './app';
import { createRootElement } from './common';

render(<App />, createRootElement('root'));
