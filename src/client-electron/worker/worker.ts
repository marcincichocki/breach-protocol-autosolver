import { setLang } from '@/common';
import { BreachProtocolOCRFragment, WorkerStatus } from '@/core';
import { solveBreachProtocol } from '@/platform-node/solve';
import { ipcRenderer as ipc } from 'electron';
import { listDisplays } from 'screenshot-desktop';

function updateStatus(status: WorkerStatus) {
  ipc.send('worker:status', status);
}

let screenId: string = null;

async function bootstrap() {
  updateStatus(WorkerStatus.BOOTSTRAP);

  setLang('en');
  const displays = await listDisplays();
  screenId = displays[0].id;

  await BreachProtocolOCRFragment.initScheduler();

  ipc.send('worker:ready');
  updateStatus(WorkerStatus.READY);
}

bootstrap();

ipc.on('worker:solve', async (event) => {
  updateStatus(WorkerStatus.WORKING);
  await solveBreachProtocol(screenId);

  event.sender.send('worker:solved');
  updateStatus(WorkerStatus.READY);
});
