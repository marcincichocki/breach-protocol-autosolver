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
  FocusDaemonSequenceCompareStrategy,
  IndexSequenceCompareStrategy,
} from '@/core';
import {
  Action,
  ActionTypes,
  AddHistoryEntryAction,
  AppSettings,
  Request,
  Response,
  SetDisplaysAction,
  SetStatusAction,
  State,
  TestThresholdData,
  UpdateSettingsAction,
  WorkerStatus,
} from '@/electron/common';
import { execSync } from 'child_process';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { listDisplays, ScreenshotDisplayOutput } from 'screenshot-desktop';
import sharp from 'sharp';
import { BreachProtocolAutosolver } from './autosolver';
import { nativeDialog } from './dialog';
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
    const langPath = this.getResourcesPath();

    await WasmBreachProtocolRecognizer.initScheduler(langPath);
  }

  private getResourcesPath() {
    return ipc.sendSync('worker:get-resources-path');
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

        nativeDialog.alert({ message });

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

    this.disposeAsyncRequestListener = this.asyncRequestListener(
      this.handleAsyncRequest.bind(this)
    );
  }

  private asyncRequestListener(handler: (req: Request) => Promise<any>) {
    ipc.on('async-request', async (event: any, req: Request) => {
      const data = await handler(req);
      const res: Response = { data, uuid: req.uuid, origin: 'worker' };

      event.sender.send('async-response', res);
    });

    return () => {
      ipc.removeAllListeners('async-request');
    };
  }

  private async onWorkerSolve(e: IpcRendererEvent, index?: number) {
    if (this.status !== WorkerStatus.Ready) {
      return;
    }

    this.updateStatus(WorkerStatus.Working);

    const robot = this.getRobot();
    const compareStrategy = this.getCompareStrategy(index);
    const bpa = new BreachProtocolAutosolver(
      this.settings,
      robot,
      this.player,
      compareStrategy
    );
    const entry = await bpa.solve();

    this.dispatch(new AddHistoryEntryAction(entry));
    this.updateStatus(WorkerStatus.Ready);
  }

  private getCompareStrategy(index?: number) {
    if (index != null) {
      return new FocusDaemonSequenceCompareStrategy(index);
    }

    return new IndexSequenceCompareStrategy();
  }

  private onStateChanged(
    e: IpcRendererEvent,
    { payload, type }: Action<State>
  ) {
    if (type === ActionTypes.UPDATE_SETTINGS) {
      this.settings = payload.settings;

      this.player.update(this.settings);
    }

    if (type === ActionTypes.SET_STATUS) {
      this.status = payload.status;
    }
  }

  private getRobot(): BreachProtocolRobot {
    if (BUILD_PLATFORM === 'win32') {
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
    } else if (BUILD_PLATFORM === 'linux') {
      return new XDoToolRobot(this.settings);
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
