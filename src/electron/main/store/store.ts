import {
  Action,
  ActionTypes,
  AppSettings,
  AppStats,
  defaultOptions,
  HistoryEntry,
  normalizeAccelerator as normalize,
  options,
  RemoveLastNHistoryEntriesAction,
  Request,
  Response,
  State,
  WorkerStatus,
} from '@/electron/common';
import { app, ipcMain as ipc, IpcMainEvent, WebContents } from 'electron';
import ElectronStore from 'electron-store';
import { ensureDirSync, remove, removeSync } from 'fs-extra';
import { join } from 'path';
import { appReducer } from './reducer';

type Middleware = (action: Action) => void;

export class Store {
  private settings = new ElectronStore<AppSettings>({
    name: 'settings',
    defaults: defaultOptions,
    migrations: {
      '>=2.1.0': (store) => {
        const keyBind = normalize(store.get('keyBind'));
        const result = options
          .filter((o) => o.id.startsWith('keyBindWithPriority'))
          .find((o) => normalize(o.defaultValue as string) === keyBind);

        if (result) {
          // Remove key bind if there is a conflict.
          store.set(result.id, '');
        }
      },
      '>=2.2.0': (store) => {
        const option = options.find((o) => o.id === 'keyBindAnalyze');
        const value = normalize(option.defaultValue as string);
        const conflict = [
          'keyBind',
          'keyBindWithPriority1',
          'keyBindWithPriority2',
          'keyBindWithPriority3',
          'keyBindWithPriority4',
          'keyBindWithPriority5',
        ]
          .map((k) => normalize(store.get(k)))
          .some((v) => v === value);

        if (conflict) {
          store.set(option.id, '');
        }
      },
    },
  });

  private history = new ElectronStore<{ data: HistoryEntry[] }>({
    name: 'history',
    defaults: { data: [] },
  });

  private defaultStats: AppStats = {
    countSuccessSession: 0,
    countSuccess: 0,
    countErrorSession: 0,
    countError: 0,
    approxDuration: 0,
    daemonsCount: 0,
    daemonsSolvedCount: 0,
  };

  private stats = new ElectronStore<AppStats>({
    name: 'stats',
    defaults: this.defaultStats,
  });

  private state = this.getInitialState();

  private middlewares: Middleware[] = [];

  constructor(
    private worker: WebContents,
    private renderer: WebContents,
    parentMiddlewares: Middleware[] = []
  ) {
    this.attachMiddlewares(parentMiddlewares);
    this.registerStoreListeners();
  }

  dispatch(action: Action, notify = false) {
    this.applyMiddleware(action);
    this.state = appReducer(this.state, action);

    if (notify) {
      this.notify(action);
    }
  }

  getState() {
    return this.state;
  }

  dispose() {
    if (process.env.NODE_ENV === 'production') {
      this.preserveState();
    }

    if (process.env.NODE_ENV === 'development') {
      removeSync(this.state.settings.screenshotDir);
    }

    ipc.removeAllListeners('main:state');
    ipc.removeAllListeners('main:get-state');
    ipc.removeAllListeners('main:async-request');
    ipc.removeAllListeners('main:async-response');
  }

  private attachMiddlewares(parentMiddlewares: Middleware[]) {
    this.middlewares.push(this.removeLastHistoryEntry.bind(this));

    if (process.env.NODE_ENV === 'production') {
      this.middlewares.push(this.removeHistoryEntriesSources.bind(this));
    }

    this.middlewares.push(...parentMiddlewares);
  }

  private removeLastHistoryEntry(action: Action) {
    if (action.type === ActionTypes.ADD_HISTORY_ENTRY) {
      const { history, settings } = this.state;
      const { length } = history;

      if (length >= settings.historySize) {
        this.dispatch(new RemoveLastNHistoryEntriesAction(1));
      }
    }
  }

  private removeHistoryEntriesSources({ type, payload }: Action) {
    if (type === ActionTypes.REMOVE_LAST_N_HISTORY_ENTRIES) {
      const entries = this.state.history.slice(-1 * payload);

      for (const { fileName } of entries) {
        if (fileName) {
          remove(fileName);
        }
      }
    }

    if (type === ActionTypes.REMOVE_HISTORY_ENTRY) {
      const { fileName } = this.state.history.find((e) => e.uuid === payload);

      if (fileName) {
        remove(fileName);
      }
    }
  }

  private createScreenshotDir() {
    const path = join(app.getPath('userData'), 'screenshots');

    ensureDirSync(path);

    return path;
  }

  private getInitialState(): State {
    const screenshotDir = this.createScreenshotDir();

    return {
      history: this.history.get('data'),
      displays: [],
      settings: { ...this.settings.store, screenshotDir },
      status: WorkerStatus.Bootstrap,
      updateStatus: null,
      stats: this.stats.store,
      analysis: null,
    };
  }

  private registerStoreListeners() {
    ipc.on('main:state', this.onState.bind(this));
    ipc.on('main:get-state', this.onGetState.bind(this));
    ipc.on('main:async-request', this.onAsyncRequest.bind(this));
  }

  private applyMiddleware(action: Action) {
    for (const middleware of this.middlewares) {
      middleware(action);
    }
  }

  private onState(event: IpcMainEvent, action: Action) {
    this.dispatch(action, true);
  }

  private notify(action: Action) {
    const stateAction = { ...action, payload: this.state };

    this.worker.send('worker:state', stateAction);
    this.renderer.send('renderer:state', stateAction);

    this.worker.send(action.type, stateAction);
    this.renderer.send(action.type, stateAction);
  }

  private onGetState(event: IpcMainEvent) {
    event.returnValue = this.state;
  }

  private onAsyncRequest(event: IpcMainEvent, req: Request) {
    function onAsyncResponse(e: IpcMainEvent, res: Response) {
      if (res.uuid !== req.uuid) return;

      ipc.removeListener('main:async-response', onAsyncResponse);

      event.sender.send('renderer:async-response', res);
    }

    ipc.on('main:async-response', onAsyncResponse);

    this.worker.send('worker:async-request', req);
  }

  private preserveState() {
    this.history.set('data', this.state.history);
    this.settings.set(this.state.settings);
    this.stats.set({
      ...this.state.stats,
      countSuccessSession: 0,
      countErrorSession: 0,
    });
  }
}
