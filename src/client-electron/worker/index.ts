import { BreachProtocolOCRFragment } from '@/core';
import { captureScreen } from '@/platform-node/robot';
import { ipcRenderer } from 'electron';
import { listDisplays } from 'screenshot-desktop';

function log(message: any) {
  ipcRenderer.send('log', message);
}

let screen: string;

async function init() {
  log('STARTING INIT');

  await BreachProtocolOCRFragment.initScheduler();
  const displays = await listDisplays();
  screen = displays[0].id;

  console.log(displays);

  ipcRenderer.send('scheduler-ready');
}

init();

ipcRenderer.on('start-autosolver', async () => {
  log('starting autosolver!!!!');

  const fileName = await captureScreen(screen);
  // do some expensive computations...

  ipcRenderer.send('autosolver-finished');
});
