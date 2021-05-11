import { setLang } from '@/common';
import {
  BreachProtocolBufferSizeFragment,
  BreachProtocolDaemonsFragment,
  BreachProtocolGridFragment,
  BreachProtocolOCRFragment,
  FragmentId,
  SharpImageContainer,
} from '@/core';
import { ipcRenderer as ipc } from 'electron';
import { listDisplays } from 'screenshot-desktop';
import sharp from 'sharp';
import {
  Action,
  Request,
  TestThresholdData,
  workerListener,
  WorkerStatus,
} from '../common';
import { BreachProtocolAutosolver } from './autosolver';

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
    case 'TEST_THRESHOLD':
      return testThreshold(req);
    default:
  }
}

function getFragment(id: FragmentId, container: SharpImageContainer) {
  switch (id) {
    case 'grid':
      return new BreachProtocolGridFragment(container);
    case 'daemons':
      return new BreachProtocolDaemonsFragment(container);
    case 'bufferSize':
      return new BreachProtocolBufferSizeFragment(container);
  }
}

async function testThreshold(req: Request<TestThresholdData>) {
  const instance = sharp(req.data.fileName);
  const container = await SharpImageContainer.create(instance);
  const fragment = getFragment(req.data.fragmentId, container);

  return fragment.recognize(req.data.threshold, false);
}

let screenId: string = null;

async function bootstrap() {
  updateStatus(WorkerStatus.Bootstrap);

  setLang('en');
  const displays = await listDisplays();
  screenId = displays[0].id;

  dispatch({ type: 'SET_DISPLAYS', payload: displays });
  dispatch({ type: 'SET_ACTIVE_DISPLAY', payload: displays[0] });

  await BreachProtocolOCRFragment.initScheduler();

  ipc.send('worker:ready');
  updateStatus(WorkerStatus.Ready);
}

bootstrap();

ipc.on('worker:solve', async () => {
  updateStatus(WorkerStatus.Working);

  const bpa = new BreachProtocolAutosolver(screenId);
  await bpa.solve();

  dispatch({ type: 'ADD_HISTORY_ENTRY', payload: bpa.toJSON() });
  updateStatus(WorkerStatus.Ready);
});
