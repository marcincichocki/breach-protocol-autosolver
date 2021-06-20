import {
  Action,
  ActionTypes,
  AppSettings,
  AppStats,
  defaultOptions,
  HistoryEntry,
  Request,
  Response,
  State,
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

  constructor(private worker: WebContents, private renderer: WebContents) {
    this.attachMiddleware(this.removeLastHistoryEntry.bind(this));
    this.registerStoreListeners();
  }

  dispatch(action: Action) {
    this.state = appReducer(this.state, action);
  }

  attachMiddleware(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  getState() {
    return this.state;
  }

  dispose() {
    if (IS_PROD) {
      this.preserveState();
    } else if (IS_DEV) {
      removeSync(this.state.settings.screenshotDir);
    }

    ipc.removeAllListeners('state');
    ipc.removeAllListeners('async-request');
    ipc.removeAllListeners('async-response');
    ipc.removeAllListeners('get-state');
  }

  private removeLastHistoryEntry(action: Action) {
    if (action.type === ActionTypes.ADD_HISTORY_ENTRY) {
      const { history, settings } = this.state;
      const { length } = history;

      if (length >= settings.historySize) {
        const { fileName } = history[length - 1];

        if (fileName) {
          remove(fileName);
        }

        this.dispatch({
          type: ActionTypes.REMOVE_LAST_HISTORY_ENTRY,
          origin: 'worker',
        });
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
      status: null,
      stats: this.stats.store,
    };
  }

  private registerStoreListeners() {
    ipc.on('state', this.onState.bind(this));
    ipc.on('get-state', this.onGetState.bind(this));
    ipc.on('async-request', this.onAsyncRequest.bind(this));
  }

  private applyMiddleware(action: Action) {
    for (const middleware of this.middlewares) {
      middleware(action);
    }
  }

  private onState(event: IpcMainEvent, action: Action) {
    this.applyMiddleware(action);
    this.dispatch(action);

    const dest = this.getDest(action);
    const returnAction = { payload: this.state, type: action.type };

    dest.send('state', returnAction);
    event.sender.send('state', returnAction);

    event.sender.send(action.type, action);
    dest.send(action.type, action);
  }

  private onGetState(event: IpcMainEvent) {
    event.returnValue = this.state;
  }

  private onAsyncRequest(event: IpcMainEvent, req: Request) {
    function onAsyncResponse(e: IpcMainEvent, res: Response) {
      if (res.uuid !== req.uuid) return;

      ipc.removeListener('async-response', onAsyncResponse);

      event.sender.send('async-response', res);
    }

    ipc.on('async-response', onAsyncResponse);

    const dest = this.getDest(req);

    dest.send('async-request', req);
  }

  private getDest(action: Action) {
    return action.origin === 'worker' ? this.renderer : this.worker;
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
