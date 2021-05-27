import { setLang } from '@/common';
import {
  BreachProtocolBufferSizeFragment,
  BreachProtocolDaemonsFragment,
  BreachProtocolGridFragment,
  BreachProtocolOCRFragment,
  SharpImageContainer,
} from '@/core';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { listDisplays } from 'screenshot-desktop';
import sharp from 'sharp';
import {
  Action,
  AppSettings,
  Request,
  TestThresholdData,
  workerAsyncRequestListener,
  WorkerStatus,
} from '../common';
import { BreachProtocolAutosolver } from './autosolver';

export class BreachProtocolWorker {
  private disposeAsyncRequestListener: () => void = null;

  private fragments: {
    grid: BreachProtocolGridFragment<sharp.Sharp>;
    daemons: BreachProtocolDaemonsFragment<sharp.Sharp>;
    bufferSize: BreachProtocolBufferSizeFragment<sharp.Sharp>;
  } = null;

  private settings: AppSettings = ipc.sendSync('get-state').settings;

  private async loadAndSetActiveDisplay() {
    const displays = await listDisplays();

    this.dispatch({ type: 'SET_DISPLAYS', payload: displays });

    const { activeDisplayId } = this.settings;

    if (displays.find((d) => d.id === activeDisplayId)) return;

    this.dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { activeDisplayId: displays[0].id },
    });
  }

  async bootstrap() {
    this.updateStatus(WorkerStatus.Bootstrap);

    this.registerListeners();

    // TODO: change lang, or remove it completly.
    setLang('en');

    await this.loadAndSetActiveDisplay();
    await BreachProtocolOCRFragment.initScheduler();

    this.updateStatus(WorkerStatus.Ready);
    ipc.send('worker:ready');
  }

  async dispose() {
    ipc.removeAllListeners('worker:solve');

    this.disposeAsyncRequestListener();
    this.disposeTestThreshold();

    await BreachProtocolOCRFragment.terminateScheduler();
  }

  private registerListeners() {
    ipc.on('worker:solve', this.onWorkerSolve.bind(this));
    ipc.on('SET_SETTINGS', this.onSetSettings.bind(this));

    this.disposeAsyncRequestListener = workerAsyncRequestListener(
      this.handleAsyncRequest.bind(this)
    );
  }

  private async onWorkerSolve() {
    this.updateStatus(WorkerStatus.Working);

    const bpa = new BreachProtocolAutosolver(this.settings);
    await bpa.solve();

    this.dispatch({ type: 'ADD_HISTORY_ENTRY', payload: bpa.toJSON() });
    this.updateStatus(WorkerStatus.Ready);
  }

  private onSetSettings(e: IpcRendererEvent, settings: AppSettings) {
    this.settings = settings;
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
