import { BreachProtocolOCRFragment } from '@/core';
import { ipcRenderer } from 'electron';

async function init() {
  await BreachProtocolOCRFragment.initScheduler();

  ipcRenderer.send('scheduler-ready');
}

init();

ipcRenderer.on('start-autosolver', () => {
  // do some expensive computations...

  ipcRenderer.send('autosolver-finished');
});
