import { createRoot } from 'react-dom/client';
import { App } from './app';
import { createRootElement } from './common';

const el = createRootElement('root');
const root = createRoot(el);

root.render(<App />);
