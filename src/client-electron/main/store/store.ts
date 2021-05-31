import { ipcMain as ipc, IpcMainEvent, WebContents } from 'electron';
import ElectronStore from 'electron-store';
import {
  Action,
  AppSettings,
  AppStats,
  HistoryEntry,
  Request,
  Response,
  State,
} from '../../common';
import { defaultOptions } from '../../options';
import { appReducer } from './reducer';

export class Store {
  private settings = new ElectronStore<AppSettings>({
    name: 'settings',
    defaults: defaultOptions,
  });
  private history = new ElectronStore<{ data: HistoryEntry[] }>({
    name: 'history',
    defaults: { data: [] },
  });

  private stats = new ElectronStore<AppStats>({
    name: 'stats',
    defaults: {
      globalCountError: 1,
      globalCountSuccess: 10,
      sessionCountError: 0,
      sessionCountSuccess: 2,
    },
  });

  private state = this.getInitialState();

  constructor(private worker: WebContents, private renderer: WebContents) {
    this.registerStoreListeners();
  }

  private getInitialState(): State {
    return {
      history: this.history.get('data'),
      displays: [],
      settings: this.settings.store,
      status: null,
      stats: this.stats.store,
    };
  }

  private registerStoreListeners() {
    ipc.on('state', this.onState.bind(this));
    ipc.on('get-state', this.onGetState.bind(this));
    ipc.on('async-request', this.onAsyncRequest.bind(this));
  }

  private onState(event: IpcMainEvent, action: Action) {
    this.state = appReducer(this.state, action);

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

  getState() {
    return this.state;
  }

  dispose() {
    if (process.env.NODE_ENV === 'production') {
      this.history.set('data', this.state.history);
      this.settings.set(this.state.settings);
    }

    ipc.removeAllListeners('state');
    ipc.removeAllListeners('async-request');
    ipc.removeAllListeners('async-response');
    ipc.removeAllListeners('get-state');
  }
}
