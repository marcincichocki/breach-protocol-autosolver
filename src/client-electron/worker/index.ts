import { BreachProtocolOCRFragment } from '@/core';
import { ipcRenderer } from 'electron';

function log(message: any) {
  ipcRenderer.send('log', message);
}

async function init() {
  log('STARTING INIT');

  await BreachProtocolOCRFragment.initScheduler();

  ipcRenderer.send('scheduler-ready');
}

init();

ipcRenderer.on('start-autosolver', () => {
  // do some expensive computations...

  ipcRenderer.send('autosolver-finished');
});
