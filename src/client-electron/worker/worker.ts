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
  AppSettings,
  Request,
  State,
  TestThresholdData,
  workerAsyncRequestListener,
  WorkerStatus,
} from '../common';
import {
  AddHistoryEntryAction,
  SetDisplaysAction,
  SetStatusAction,
  UpdateSettingsAction,
} from '../actions';
import { BreachProtocolAutosolver } from './autosolver';
import { WindowsRobot } from './robot';

export class BreachProtocolWorker {
  private disposeAsyncRequestListener: () => void = null;

  private displays: ScreenshotDisplayOutput[] = null;

  private fragments: {
    grid: BreachProtocolGridFragment<sharp.Sharp>;
    daemons: BreachProtocolDaemonsFragment<sharp.Sharp>;
    bufferSize: BreachProtocolBufferSizeFragment<sharp.Sharp>;
  } = null;

  private settings: AppSettings = ipc.sendSync('get-state').settings;

  private async loadAndSetActiveDisplay() {
    this.displays = await listDisplays();

    this.dispatch(new SetDisplaysAction(this.displays));

    const { activeDisplayId } = this.settings;

    if (this.displays.find((d) => d.id === activeDisplayId)) return;

    this.dispatch(
      new UpdateSettingsAction(
        { activeDisplayId: this.displays[0].id },
        'worker',
        { notify: false }
      )
    );
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
    ipc.removeAllListeners('state');

    this.disposeAsyncRequestListener();
    this.disposeTestThreshold();

    await BreachProtocolOCRFragment.terminateScheduler();
  }

  private registerListeners() {
    ipc.on('worker:solve', this.onWorkerSolve.bind(this));
    ipc.on('state', this.onStateChanged.bind(this));

    this.disposeAsyncRequestListener = workerAsyncRequestListener(
      this.handleAsyncRequest.bind(this)
    );
  }

  private async onWorkerSolve(e: IpcRendererEvent, basePath: string) {
    this.updateStatus(WorkerStatus.Working);

    const { activeDisplayId } = this.settings;
    const { dpiScale } = this.displays.find((d) => d.id === activeDisplayId);
    const robot = new WindowsRobot(this.settings, basePath, dpiScale);
    const bpa = new BreachProtocolAutosolver(this.settings, robot);
    await bpa.solve();

    this.dispatch(new AddHistoryEntryAction(bpa.toJSON()));
    this.updateStatus(WorkerStatus.Ready);
  }

  private onStateChanged(
    e: IpcRendererEvent,
    { payload, type }: Action<State>
  ) {
    if (type === 'UPDATE_SETTINGS') {
      this.settings = payload.settings;
    }
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
    this.dispatch(new SetStatusAction(payload));
  }

  private dispatch(action: Action) {
    ipc.send('state', action);
  }
}
