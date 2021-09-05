import { RobotSettings, SharpImageContainerConfig } from '@/common/node';
import {
  BreachProtocolFragmentResults,
  BreachProtocolResultJSON,
  FragmentId,
  SequenceJSON,
} from '@/core';
import { Accelerator, ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { ScreenshotDisplayOutput } from 'screenshot-desktop';
import { v4 as uuidv4 } from 'uuid';
import { SoundPlayerConfig } from '../worker/sound-player';

export enum WorkerStatus {
  Disconnected,
  Disabled,
  Bootstrap,
  Ready,
  Working,
}

export enum BreachProtocolStatus {
  Pending,
  Resolved,
  Rejected,
}

export enum BreachProtocolSolveProgress {
  Pending = 1 << 0,
  FragmentsValid = 1 << 1,
  SolutionFound = 1 << 2,
}

export interface HistoryEntry {
  version: string;
  commitSha: string;
  uuid: string;
  startedAt: number;
  finishedAt: number;
  status: BreachProtocolStatus;
  fileName: string;
  settings: AppSettings;
  fragments: BreachProtocolFragmentResults;
  sequences: SequenceJSON[];
  result: BreachProtocolResultJSON;
}

export interface AppSettings
  extends RobotSettings,
    Required<SharpImageContainerConfig>,
    SoundPlayerConfig {
  keyBind: Accelerator;
  historySize: number;
  preserveSourceOnSuccess: boolean;
  checkForUpdates: boolean;
  autoUpdate: boolean;
  minimizeToTray: boolean;
  thresholdGrid: number;
  thresholdGridAuto: boolean;
  thresholdDaemons: number;
  thresholdDaemonsAuto: boolean;
  thresholdBufferSize: number;
  thresholdBufferSizeAuto: boolean;
  experimentalBufferSizeRecognition: boolean;
  outputDevice: 'mouse' | 'keyboard';
  engine: 'nircmd' | 'ahk' | 'xdotool';
  ahkBinPath: string;
  resolveDelay: number;
}

export interface AppStats {
  /** Amount of successful breach protocols during session. */
  countSuccessSession: number;

  /** Total amount of successful breach protocols. */
  countSuccess: number;

  /** Amount of failed breach protocols during session. */
  countErrorSession: number;

  /** Total amount of failed breach protocols. */
  countError: number;

  /** Sum of approximated duration of every successful breach protocol. */
  approxDuration: number;

  /** Total amount of daemons. */
  daemonsCount: number;

  /** Total amount of solved daemons. */
  daemonsSolvedCount: number;
}

export enum UpdateStatus {
  Error,
  NetworkError,
  CheckingForUpdate,
  UpdateNotAvailable,
  UpdateAvailable,
  Downloading,
  UpdateDownloaded,
}

export interface State {
  history: HistoryEntry[];
  displays: ScreenshotDisplayOutput[];
  settings: AppSettings;
  status: WorkerStatus;
  updateStatus: UpdateStatus;
  stats: AppStats;
}

export type Origin = 'worker' | 'renderer';

export interface Action<T = any> {
  type: string;
  payload?: T;
  origin: Origin;
  meta?: Record<string, any>;
}

export interface Request<T = any> {
  type: string;
  data?: T;
  uuid: string;
  origin: Origin;
}

export interface Response<T = any> {
  data: T;
  uuid: string;
  origin: Origin;
}

export function createAsyncRequestDispatcher(origin: Origin) {
  return <TRes, TReq = any>(action: Omit<Request<TReq>, 'origin' | 'uuid'>) =>
    new Promise<TRes>((resolve) => {
      const uuid = uuidv4();
      const req: Request<TReq> = { ...action, origin, uuid };

      function onAsyncResponse(e: IpcRendererEvent, res: Response<TRes>) {
        if (res.uuid !== uuid) return;

        ipc.removeListener('async-response', onAsyncResponse);

        resolve(res.data);
      }

      ipc.on('async-response', onAsyncResponse);
      ipc.send('async-request', req);
    });
}

export const rendererAsyncRequestDispatcher =
  createAsyncRequestDispatcher('renderer');

export function createAsyncRequestListener(origin: Origin) {
  return (handler: (req: Request) => Promise<any>) => {
    ipc.on('async-request', async (event, req: Request) => {
      const data = await handler(req);
      const res: Response = { data, uuid: req.uuid, origin };

      event.sender.send('async-response', res);
    });

    return () => {
      ipc.removeAllListeners('async-request');
    };
  };
}

export const workerAsyncRequestListener = createAsyncRequestListener('worker');

export interface TestThresholdData {
  fileName: string;
  threshold: number;
  fragmentId: FragmentId;
}

export class NativeDialog {
  static async confirm(options: Electron.MessageBoxOptions) {
    const defaultOptions: Partial<Electron.MessageBoxOptions> = {
      title: 'Confirm',
      defaultId: 0,
      cancelId: 1,
      noLink: true,
      type: 'warning',
      buttons: ['Ok', 'Cancel'],
    };
    const { response } = await NativeDialog.showMessageBox({
      ...defaultOptions,
      ...options,
    });

    return !response;
  }

  static async alert(options?: Electron.MessageBoxOptions) {
    const defaultOptions: Partial<Electron.MessageBoxOptions> = {
      noLink: true,
      defaultId: 0,
      title: 'Alert',
      type: 'warning',
      buttons: ['Ok'],
    };

    return NativeDialog.showMessageBox({
      ...defaultOptions,
      ...options,
    });
  }

  private static showMessageBox(
    options: Electron.MessageBoxOptions
  ): Promise<Electron.MessageBoxReturnValue> {
    if (require('is-electron-renderer')) {
      return ipc.invoke('renderer:show-message-box', options);
    } else {
      const { dialog } = require('electron');

      return dialog.showMessageBox(options);
    }
  }
}
