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
  AnalysisOptions,
  AppSettings,
  BreachProtocolStatus,
  ClearAnalysisAction,
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

type AsyncRequestListener = (req: Request) => Promise<any>;

export class BreachProtocolWorker {
  private displays: ScreenshotDisplayOutput[] = null;

  private fragments: BreachProtocolFragments = null;

  private settings: AppSettings = this.getSettings();

  private readonly player = new BreachProtocolSoundPlayer(this.settings);

  private bpa: BreachProtocolAutosolver = null;

  private status: WorkerStatus = WorkerStatus.Bootstrap;

  private readonly asyncRequestListeners: Record<string, AsyncRequestListener> =
    {
      TEST_THRESHOLD_INIT: this.initTestThreshold.bind(this),
      TEST_THRESHOLD_DISPOSE: this.disposeTestThreshold.bind(this),
      TEST_THRESHOLD: this.testThreshold.bind(this),
      ANALYZE_DISCARD: this.discardAnalyze.bind(this),
      ANALYZE_RESOLVE: this.createTask(this.analyzeResolve),
      ANALYZE_FILE: this.createTask(this.analyzeFile),
    };

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

    this.discardAnalysis();
    this.disposeTestThreshold();

    await WasmBreachProtocolRecognizer.terminateScheduler();
  }

  private registerListeners() {
    ipc.on('worker:solve', this.createTask(this.onWorkerSolve));
    ipc.on('worker:analyze', this.createTask(this.onWorkerAnazyle));
    ipc.on('worker:state', this.onStateChanged.bind(this));
    ipc.on('worker:async-request', this.asyncRequestListener.bind(this));
  }

  /** Wrap callback and return new task. */
  private createTask<T extends (...args: any[]) => Promise<void>>(callback: T) {
    return async (...args: any[]) => {
      if (this.status !== WorkerStatus.Ready) {
        return;
      }

      this.updateStatus(WorkerStatus.Working);

      await callback.apply(this, args);

      this.updateStatus(WorkerStatus.Ready);
    };
  }

  private async asyncRequestListener(event: IpcRendererEvent, req: Request) {
    const data = await this.asyncRequestListeners[req.type](req);
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

  private async onWorkerAnazyle(e: IpcRendererEvent, file?: string) {
    this.discardAnalysis(true);
    this.bpa = this.getAutosolver();

    await this.bpa.analyze(file);

    const entry = this.bpa.toHistoryEntry();

    if (entry.status === BreachProtocolStatus.Rejected) {
      this.bpa = null;
      this.dispatch(new AddHistoryEntryAction(entry));

      if (this.settings.focusOnError) {
        this.focusRendererWindow();
      }
    } else {
      const results = this.bpa.getResults();
      const options = this.getAnalysisOptions(file);
      this.dispatch(new SetAnalysisAction({ entry, results, options }));

      this.focusRendererWindow();
    }
  }

  private async onWorkerSolve(e: IpcRendererEvent, index?: number) {
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
    this.discardAnalysis();
  }

  private getAnalysisOptions(file?: string): AnalysisOptions {
    const origin = file ? 'file' : 'screenshot';

    return { origin };
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

  private discardAnalysis(skipClean?: boolean) {
    if (this.bpa) {
      this.bpa.dispose();
      this.bpa = null;

      if (!skipClean) {
        this.dispatch(new ClearAnalysisAction());
      }
    }
  }

  private async discardAnalyze() {
    this.discardAnalysis();
  }

  private async analyzeFile({ data }: Request<string>) {
    await this.onWorkerAnazyle(null, data);
  }

  private async analyzeResolve({ data }: Request<BreachProtocolResultJSON>) {
    await this.bpa.resolve(data);

    const entry = this.bpa.toHistoryEntry();

    this.bpa = null;

    this.dispatch(new AddHistoryEntryAction(entry));
    this.dispatch(new ClearAnalysisAction());
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

  private async disposeTestThreshold() {
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
