import { ipcRenderer as ipc } from 'electron';
import { useState } from 'react';
import styled from 'styled-components';
import { StatusBar } from './components/StatusBar';

ipc.once('worker:ready', () => console.log('worker ready'));

const Main = styled.main`
  flex-grow: 1;
`;

export const App = () => {
  const [status, setStatus] = useState(null);

  ipc.on('worker:status', (event, value) => setStatus(value));

  return (
    <>
      <Main />
      <StatusBar status={status} />
    </>
  );
};
