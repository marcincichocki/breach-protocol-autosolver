import { options } from '@/platform-node/cli';
import { ipcMain as ipc, IpcMainEvent, WebContents } from 'electron';
import ElectronStore from 'electron-store';
import {
  Action,
  AppSettings,
  HistoryEntry,
  Request,
  Response,
  State,
} from '../common';
import { defaultOptions } from '../options';

function reducer<T>({ type, payload }: Action<T>, state: State) {
  switch (type) {
    case 'SET_DISPLAYS':
      return {
        ...state,
        displays: payload,
      };
    case 'SET_STATUS':
      return { ...state, status: payload };
    case 'ADD_HISTORY_ENTRY':
      return {
        ...state,
        history: [payload, ...state.history].slice(0, options.debugLimit),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...payload,
        },
      };
  }
}

export class Store {
  private settings = new ElectronStore<AppSettings>({
    name: 'settings',
    defaults: defaultOptions,
  });
  private history = new ElectronStore<{ data: HistoryEntry[] }>({
    name: 'history',
    defaults: { data: [] },
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
    };
  }

  private registerStoreListeners() {
    ipc.on('state', this.onState.bind(this));
    ipc.on('get-state', this.onGetState.bind(this));
    ipc.on('async-request', this.onAsyncRequest.bind(this));
  }

  private onState(event: IpcMainEvent, action: Action) {
    this.state = reducer(action, this.state);

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
    this.history.set('data', this.state.history);
    this.settings.set(this.state.settings);

    ipc.removeAllListeners('state');
    ipc.removeAllListeners('async-request');
    ipc.removeAllListeners('async-response');
    ipc.removeAllListeners('get-state');
  }
}
