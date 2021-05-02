import { IpcRendererEvent, ipcRenderer as ipc } from 'electron';
import { ScreenshotDisplayOutput } from 'screenshot-desktop';
import { v4 as uuidv4 } from 'uuid';

export enum WorkerStatus {
  BOOTSTRAP,
  READY,
  WORKING,
}

export interface HistoryEntry {}

export interface AppSettings {}

export interface State {
  history: HistoryEntry[];
  displays: ScreenshotDisplayOutput[];
  activeDisplay: ScreenshotDisplayOutput;
  settings: {};
  status: WorkerStatus;
}

type Origin = 'worker' | 'renderer';

export interface Action<T = any> {
  type: string;
  payload?: T;
  origin: Origin;
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

export function createDispatcher(origin: Origin) {
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

export const rendererDispatcher = createDispatcher('renderer');

export function createListener(origin: Origin) {
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

export const workerListener = createListener('worker');