import { setLang } from '@/common';
import { BreachProtocolOCRFragment } from '@/core';
import { solveBreachProtocol } from '@/platform-node/solve';
import { ipcRenderer as ipc } from 'electron';
import { listDisplays } from 'screenshot-desktop';
import { Action, Request, workerListener, WorkerStatus } from '../common';

function updateStatus(payload: WorkerStatus) {
  dispatch({ type: 'SET_STATUS', payload });
}

function dispatch(action: Omit<Action, 'origin'>) {
  ipc.send('state', { ...action, origin: 'worker' });
}

ipc.on('SET_ACTIVE_DISPLAY', (event, state) => {
  screenId = state.id;
});

const disposeAsyncRequestListener = workerListener(handleAsyncRequest);

async function handleAsyncRequest(req: Request) {
  switch (req.type) {
    default:
  }
}

let screenId: string = null;

async function bootstrap() {
  updateStatus(WorkerStatus.BOOTSTRAP);

  setLang('en');
  const displays = await listDisplays();
  screenId = displays[0].id;

  dispatch({ type: 'SET_DISPLAYS', payload: displays });
  dispatch({ type: 'SET_ACTIVE_DISPLAY', payload: displays[0] });

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
