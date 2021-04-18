import { setLang } from '@/common';
import { BreachProtocolOCRFragment } from '@/core';
import { solveBreachProtocol } from '@/platform-node/solve';
import { Options, setOptions } from '@/platform-node/cli';
import { ipcRenderer } from 'electron';
import { listDisplays } from 'screenshot-desktop';

function log(...args: any[]) {
  ipcRenderer.send('log', args);
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

ipcRenderer.on('argv', (event, options: Options) => {
  log('got options: %o', options);
  setOptions(options);
});

ipcRenderer.on('start-autosolver', async () => {
  log('starting autosolver!!!!');

  await solveBreachProtocol(screen);
  // do some expensive computations...

  ipcRenderer.send('autosolver-finished');
});
