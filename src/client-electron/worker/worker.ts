import { setLang } from '@/common';
import {
  BreachProtocolBufferSizeFragment,
  BreachProtocolDaemonsFragment,
  BreachProtocolGridFragment,
  BreachProtocolOCRFragment,
  SharpImageContainer,
} from '@/core';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { listDisplays, ScreenshotDisplayOutput } from 'screenshot-desktop';
import sharp from 'sharp';
import {
  Action,
  Request,
  TestThresholdData,
  workerAsyncRequestListener,
  WorkerStatus,
} from '../common';
import { BreachProtocolAutosolver } from './autosolver';

class BreachProtocolWorker {
  private activeDisplayId: string = null;

  private disposeAsyncRequestListener: () => void = null;

  private fragments: {
    grid: BreachProtocolGridFragment<sharp.Sharp>;
    daemons: BreachProtocolDaemonsFragment<sharp.Sharp>;
    bufferSize: BreachProtocolBufferSizeFragment<sharp.Sharp>;
  } = null;

  async bootstrap() {
    this.registerListeners();

    this.updateStatus(WorkerStatus.Bootstrap);

    // TODO: change lang, or remove it completly.
    setLang('en');
    const displays = await listDisplays();
    this.activeDisplayId = displays[0].id;

    this.dispatch({ type: 'SET_DISPLAYS', payload: displays });
    this.dispatch({ type: 'SET_ACTIVE_DISPLAY', payload: displays[0] });

    await BreachProtocolOCRFragment.initScheduler();

    this.updateStatus(WorkerStatus.Ready);
    ipc.send('worker:ready');
  }

  dispose() {
    ipc.removeAllListeners('worker:solve');
    ipc.removeAllListeners('SET_ACTIVE_DISPLAY');

    this.disposeAsyncRequestListener();
    this.disposeTestThreshold();
  }

  private registerListeners() {
    ipc.on('worker:solve', this.onWorkerSolve.bind(this));
    ipc.on('SET_ACTIVE_DISPLAY', this.onSetActiveDisplay.bind(this));

    this.disposeAsyncRequestListener = workerAsyncRequestListener(
      this.handleAsyncRequest.bind(this)
    );
  }

  private async onWorkerSolve() {
    this.updateStatus(WorkerStatus.Working);

    const bpa = new BreachProtocolAutosolver(this.activeDisplayId);
    await bpa.solve();

    this.dispatch({ type: 'ADD_HISTORY_ENTRY', payload: bpa.toJSON() });
    this.updateStatus(WorkerStatus.Ready);
  }

  private onSetActiveDisplay(
    e: IpcRendererEvent,
    display: ScreenshotDisplayOutput
  ) {
    this.activeDisplayId = display.id;
  }

  private async handleAsyncRequest(req: Request) {
    switch (req.type) {
      case 'TEST_THRESHOLD_INIT':
        return this.initTestThreshold(req);
      case 'TEST_THRESHOLD_DISPOSE':
        return this.disposeTestThreshold();
      case 'TEST_THRESHOLD':
        return this.testThreshold(req);
      default:
    }
  }

  private async initTestThreshold(req: Request<string>) {
    const instance = sharp(req.data);
    const container = await SharpImageContainer.create(instance);

    this.fragments = {
      grid: new BreachProtocolGridFragment(container),
      daemons: new BreachProtocolDaemonsFragment(container),
      bufferSize: new BreachProtocolBufferSizeFragment(container),
    };
  }

  private disposeTestThreshold() {
    this.fragments = null;
  }

  private async testThreshold(req: Request<TestThresholdData>) {
    const fragment = this.fragments[req.data.fragmentId];

    return fragment.recognize(req.data.threshold, false);
  }

  private updateStatus(payload: WorkerStatus) {
    this.dispatch({ type: 'SET_STATUS', payload });
  }

  private dispatch(action: Omit<Action, 'origin'>) {
    ipc.send('state', { ...action, origin: 'worker' });
  }
}

const worker = new BreachProtocolWorker();

// TODO: error handling in worker.
worker.bootstrap();

window.addEventListener('unload', () => {
  worker.dispose();
});
