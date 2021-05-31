import {
  BreachProtocolExitStrategy,
  BreachProtocolFragmentResults,
  BreachProtocolResultJSON,
  FragmentId,
  SequenceJSON,
} from '@/core';
import { Options } from '@/platform-node/cli';
import { Accelerator, ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { ScreenshotDisplayOutput } from 'screenshot-desktop';
import { v4 as uuidv4 } from 'uuid';

export enum WorkerStatus {
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
  uuid: string;
  startedAt: number;
  finishedAt: number;
  status: BreachProtocolStatus;
  fileName: string;
  settings: AppSettings;
  fragments: BreachProtocolFragmentResults;
  sequences: SequenceJSON[];
  result: BreachProtocolResultJSON;
  exitStrategy: BreachProtocolExitStrategy;
}

export interface AppSettings {
  keyBind: Accelerator;
  historySize: number;
  preserveSourceOnSuccess: boolean;
  soundEnabled: boolean;
  errorSoundPath: string;
  checkForUpdates: boolean;
  autoUpdate: boolean;
  thresholdGrid: number;
  thresholdGridAuto: boolean;
  thresholdDaemons: number;
  thresholdDaemonsAuto: boolean;
  thresholdBufferSize: number;
  thresholdBufferSizeAuto: boolean;
  delay: number;
  autoExit: boolean;
  useScaling: boolean;
  experimentalBufferSizeRecognition: boolean;
  format: 'png' | 'jpg';
  activeDisplayId: string;
}

export interface AppStats {
  sessionCountSuccess: number;
  globalCountSuccess: number;
  sessionCountError: number;
  globalCountError: number;
}

export interface State {
  history: HistoryEntry[];
  displays: ScreenshotDisplayOutput[];
  settings: AppSettings;
  status: WorkerStatus;
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
