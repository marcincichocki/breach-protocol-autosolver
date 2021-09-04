import {
  AhkRobot,
  BreachProtocolRobot,
  NirCmdRobot,
  SharpImageContainer,
  XDoToolRobot,
} from '@/common/node';
import { WasmBreachProtocolRecognizer } from '@/common/node/recognizer-wasm';
import {
  BreachProtocolBufferSizeFragment,
  BreachProtocolDaemonsFragment,
  BreachProtocolGridFragment,
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
import { execSync } from 'child_process';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { join } from 'path';
import { listDisplays, ScreenshotDisplayOutput } from 'screenshot-desktop';
import sharp from 'sharp';
import { NativeDialog } from '../common';
import { BreachProtocolAutosolver } from './autosolver';
import { BreachProtocolSoundPlayer } from './sound-player';

export class BreachProtocolWorker {
  private disposeAsyncRequestListener: () => void = null;

  private displays: ScreenshotDisplayOutput[] = null;

  private fragments: {
    grid: BreachProtocolGridFragment<sharp.Sharp>;
    daemons: BreachProtocolDaemonsFragment<sharp.Sharp>;
    bufferSize: BreachProtocolBufferSizeFragment<sharp.Sharp>;
  } = null;

  private settings: AppSettings = ipc.sendSync('get-state').settings;

  private readonly player = new BreachProtocolSoundPlayer(this.settings);

  private status: WorkerStatus = WorkerStatus.Bootstrap;

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
    this.registerListeners();

    await this.loadAndSetActiveDisplay();
    await this.initTesseractScheduler();

    const status = this.validateExternalDependencies()
      ? WorkerStatus.Ready
      : WorkerStatus.Disabled;

    this.updateStatus(status);
  }

  private async initTesseractScheduler() {
    const langPath =
      BUILD_PLATFORM === 'linux' && process.env.NODE_ENV === 'production'
        ? join(__dirname, '../..')
        : './resources';

    await WasmBreachProtocolRecognizer.initScheduler(langPath);
  }

  private validateExternalDependencies() {
    if (BUILD_PLATFORM === 'win32') {
      if (this.settings.engine === 'ahk' && !this.settings.ahkBinPath) {
        return false;
      }
    }

    if (BUILD_PLATFORM === 'linux') {
      const isImageMagickInstalled = this.isInstalled('import');
      const isXDoToolInstalled = this.isInstalled('xdotool');

      if (!isImageMagickInstalled || !isXDoToolInstalled) {
        const message = 'imagemagick and xdotool packages are required!';

        NativeDialog.alert({ message });

        return false;
      }
    }

    return true;
  }

  /** NOTE: This will only work on linux. */
  private isInstalled(bin: string) {
    try {
      execSync(`command -v ${bin}`);
    } catch (e) {
      return false;
    }

    return true;
  }

  async dispose() {
    ipc.removeAllListeners('worker:solve');
    ipc.removeAllListeners('state');

    this.disposeAsyncRequestListener();
    this.disposeTestThreshold();

    await WasmBreachProtocolRecognizer.terminateScheduler();
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
    const bpa = new BreachProtocolAutosolver(this.settings, robot, this.player);
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

      this.player.update(payload.settings);
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
      case 'xdotool':
        return new XDoToolRobot(this.settings);
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
    const { downscaleSource } = this.settings;
    const container = await SharpImageContainer.create(instance, {
      downscaleSource,
    });
    const recognizer = new WasmBreachProtocolRecognizer();

    this.fragments = {
      grid: new BreachProtocolGridFragment(container, recognizer),
      daemons: new BreachProtocolDaemonsFragment(container, recognizer),
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
