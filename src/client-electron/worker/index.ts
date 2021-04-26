import { setLang } from '@/common';
import { BreachProtocolOCRFragment } from '@/core';
import { solveBreachProtocol } from '@/platform-node/solve';
import { ipcRenderer as ipc } from 'electron';
import { listDisplays } from 'screenshot-desktop';

let screenId: string = null;

async function bootstrap() {
  setLang('en');
  const displays = await listDisplays();
  screenId = displays[0].id;

  await BreachProtocolOCRFragment.initScheduler();

  ipc.send('worker:ready');
}

bootstrap();

ipc.on('worker:solve', async () => {
  await solveBreachProtocol(screenId);
});
