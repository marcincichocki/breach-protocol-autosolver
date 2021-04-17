import { setLang } from '@/common';
import { BreachProtocolOCRFragment } from '@/core';
import { captureScreen } from '@/platform-node/robot';
import { solveBreachProtocol } from '@/platform-node/solve';
import { ipcRenderer } from 'electron';
import { listDisplays } from 'screenshot-desktop';

function log(message: any) {
  ipcRenderer.send('log', message);
}

let screen: string;

async function init() {
  log('STARTING INIT');
  setLang('en');
  await BreachProtocolOCRFragment.initScheduler();
  const displays = await listDisplays();
  screen = displays[0].id;

  console.log(displays);

  ipcRenderer.send('scheduler-ready');
}

init();

ipcRenderer.on('start-autosolver', async () => {
  log('starting autosolver!!!!');

  await solveBreachProtocol(screen);
  // do some expensive computations...

  ipcRenderer.send('autosolver-finished');
});
