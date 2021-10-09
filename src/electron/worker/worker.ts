import { uniqueWith } from '@/common';
import {
  AutoHotkeyRobot,
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
  BreachProtocolResultJSON,
  FocusDaemonSequenceCompareStrategy,
  IndexSequenceCompareStrategy,
  SequenceCompareStrategy,
} from '@/core';
import {
  Action,
  ActionTypes,
  AddHistoryEntryAction,
  AppSettings,
  BreachProtocolStatus,
  Request,
  Response,
  SetAnalysisAction,
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

interface BreachProtocolFragments {
  grid: BreachProtocolGridFragment<sharp.Sharp>;
  daemons: BreachProtocolDaemonsFragment<sharp.Sharp>;
  bufferSize: BreachProtocolBufferSizeFragment<sharp.Sharp>;
}

export class BreachProtocolWorker {
  private displays: ScreenshotDisplayOutput[] = null;

  private fragments: BreachProtocolFragments = null;

  private settings: AppSettings = this.getSettings();

  private readonly player = new BreachProtocolSoundPlayer(this.settings);

  // reference to bpa used to anazyling.
  private bpa: BreachProtocolAutosolver = null;

  private status: WorkerStatus = WorkerStatus.Bootstrap;

  private async loadAndSetActiveDisplay() {
    this.displays = await listDisplays();

    this.dispatch(new SetDisplaysAction(this.displays));

    const { activeDisplayId } = this.settings;

    if (this.displays.find((d) => d.id === activeDisplayId)) return;

    this.dispatch(
      new UpdateSettingsAction(
        { activeDisplayId: this.displays[0].id },
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

  private getSettings(): AppSettings {
    return ipc.sendSync('main:get-state').settings;
  }

  private getResourcesPath(): string {
    return ipc.sendSync('main:get-resources-path');
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
    ipc.removeAllListeners('worker:analyze');
    ipc.removeAllListeners('worker:state');
    ipc.removeAllListeners('worker:async-request');

    this.disposeTestThreshold();

    await WasmBreachProtocolRecognizer.terminateScheduler();
  }

  private registerListeners() {
    ipc.on('worker:solve', this.onWorkerSolve.bind(this));
    ipc.on('worker:analyze', this.onWorkerAnazyle.bind(this));
    ipc.on('worker:state', this.onStateChanged.bind(this));
    ipc.on('worker:async-request', this.asyncRequestListener.bind(this));
  }

  private async asyncRequestListener(event: IpcRendererEvent, req: Request) {
    const data = await this.handleAsyncRequest(req);
    const res: Response = { data, uuid: req.uuid };

    event.sender.send('main:async-response', res);
  }

  private getAutosolver(compareStrategy?: SequenceCompareStrategy) {
    return new BreachProtocolAutosolver(
      this.settings,
      this.getRobot(),
      this.player,
      compareStrategy ?? this.getCompareStrategy()
    );
  }

  private async onWorkerAnazyle() {
    if (this.status !== WorkerStatus.Ready) {
      return;
    }

    this.updateStatus(WorkerStatus.Working);

    this.bpa = this.getAutosolver();
    const entry = await this.bpa.analyze();

    if (entry.status === BreachProtocolStatus.Rejected) {
      this.clearAnalyze();
      this.dispatch(new AddHistoryEntryAction(entry));

      if (this.settings.focusOnError) {
        this.focusRendererWindow();
      }
    } else {
      this.dispatch(new SetAnalysisAction({ entry, results: [] }));

      this.focusRendererWindow();
    }

    this.updateStatus(WorkerStatus.Ready);
  }

  private async onWorkerSolve(e: IpcRendererEvent, index?: number) {
    if (this.status !== WorkerStatus.Ready) {
      return;
    }

    this.updateStatus(WorkerStatus.Working);
    this.clearAnalyze();

    const compareStrategy = this.getCompareStrategy(index);
    const bpa = this.getAutosolver(compareStrategy);
    const entry = await bpa.solve();

    if (
      entry.status === BreachProtocolStatus.Rejected &&
      this.settings.focusOnError
    ) {
      this.focusRendererWindow();
    }

    this.dispatch(new AddHistoryEntryAction(entry));
    this.updateStatus(WorkerStatus.Ready);
  }

  private focusRendererWindow() {
    ipc.send('main:focus-renderer');
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
          return new AutoHotkeyRobot(this.settings);
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
      case 'ANALYZE_INIT':
        return this.analyzeInit();
      case 'ANALYZE_DISPOSE':
        return this.clearAnalyze();
      case 'ANALYZE_RESOLVE':
        return this.resolve(req);
      default:
    }
  }

  private analyzeInit() {
    // NOTE: This filter does not guarantee that shortest sequence will be preserved.
    return this.bpa.results
      .filter(Boolean)
      .map((r) => r.toJSON())
      .filter(uniqueWith((r) => r.sequence.parts.sort().join('')));
  }

  private clearAnalyze() {
    this.bpa = null;
  }

  private async resolve({ data }: Request<BreachProtocolResultJSON>) {
    if (this.status !== WorkerStatus.Ready) {
      return;
    }

    this.updateStatus(WorkerStatus.Working);

    const id = data.path.join('');
    const entry = await this.bpa.solve(id, true);

    this.clearAnalyze();
    this.dispatch(new AddHistoryEntryAction(entry));
    this.updateStatus(WorkerStatus.Ready);
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
    ipc.send('main:state', action);
  }
}
