import {
  AhkRobot,
  BreachProtocolRobot,
  NirCmdRobot,
  SharpImageContainer,
} from '@/common/node';
import {
  BreachProtocolBufferSizeFragment,
  BreachProtocolDaemonsFragment,
  BreachProtocolGridFragment,
  BreachProtocolOCRFragment,
} from '@/core';
import {
  Action,
  ActionTypes,
  AddHistoryEntryAction,
  AppSettings,
  Request,
  SetDisplaysAction,
  SetStatusAction,
  State,
  TestThresholdData,
  UpdateSettingsAction,
  workerAsyncRequestListener,
  WorkerStatus,
} from '@/electron/common';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { listDisplays, ScreenshotDisplayOutput } from 'screenshot-desktop';
import sharp from 'sharp';
import { BreachProtocolAutosolver } from './autosolver';

export class BreachProtocolWorker {
  private disposeAsyncRequestListener: () => void = null;

  private displays: ScreenshotDisplayOutput[] = null;

  private fragments: {
    grid: BreachProtocolGridFragment<sharp.Sharp>;
    daemons: BreachProtocolDaemonsFragment<sharp.Sharp>;
    bufferSize: BreachProtocolBufferSizeFragment<sharp.Sharp>;
  } = null;

  private settings: AppSettings = ipc.sendSync('get-state').settings;

  private status: WorkerStatus;

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

  private async onWorkerSolve() {
    if (this.status !== WorkerStatus.Ready) {
      return;
    }

    this.updateStatus(WorkerStatus.Working);

    const robot = this.getRobot();
    const bpa = new BreachProtocolAutosolver(this.settings, robot);
    const entry = await bpa.solve();

    this.dispatch(new AddHistoryEntryAction(entry));
    this.updateStatus(WorkerStatus.Ready);
  }

  private onStateChanged(
    e: IpcRendererEvent,
    { payload, type }: Action<State>
  ) {
    if (type === ActionTypes.UPDATE_SETTINGS) {
      this.settings = payload.settings;
    }

    if (type === ActionTypes.SET_STATUS) {
      this.status = payload.status;
    }
  }

  private getRobot(): BreachProtocolRobot {
    switch (this.settings.engine) {
      case 'ahk':
        return new AhkRobot(this.settings);
      case 'nircmd':
        const { activeDisplayId } = this.settings;
        const { dpiScale } = this.displays.find(
          (d) => d.id === activeDisplayId
        );

        return new NirCmdRobot(this.settings, dpiScale);
      default:
        throw new Error(`Invalid engine "${this.settings.engine}" selected!`);
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

  private updateStatus(status: WorkerStatus) {
    this.dispatch(new SetStatusAction(status));
  }

  private dispatch(action: Action) {
    ipc.send('state', action);
  }
}
