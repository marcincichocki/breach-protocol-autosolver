import { ipcRenderer as ipc } from 'electron/renderer';

ipc.once('worker:ready', () => console.log('worker ready'));

export const App = () => <div className="app">it works!</div>;
