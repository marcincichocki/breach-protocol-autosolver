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

function reducer<T>({ type, payload }: Action<T>, state: State) {
  switch (type) {
    case 'SET_ACTIVE_DISPLAY':
      return {
        ...state,
        activeDisplay: payload,
      };
    case 'SET_DISPLAYS':
      return {
        ...state,
        displays: payload,
      };
    case 'SET_STATUS':
      return { ...state, status: payload };
  }
}

export class Store {
  private state = this.getInitialState();

  private settings = new ElectronStore<AppSettings>({
    name: 'settings',
    defaults: {},
  });
  private history = new ElectronStore<{ data: HistoryEntry[] }>({
    name: 'history',
    defaults: { data: [] },
  });

  constructor(private worker: WebContents, private renderer: WebContents) {
    this.registerStoreListeners();
  }

  private getInitialState(): State {
    return {
      history: this.history.get('data'),
      displays: [],
      activeDisplay: null,
      settings: {},
      status: null,
    };
  }

  private registerStoreListeners() {
    ipc.on('state', this.onState.bind(this));
    ipc.on('get-state', this.onGetState.bind(this));
    ipc.on('async-request', this.onAsyncRequest.bind(this));
  }

  private onState(event: IpcMainEvent, action: Action) {
    const dest = this.getDest(action);
    this.state = reducer(action, this.state);

    dest.send('state', this.state);
    dest.send(action.type, action.payload);
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

    ipc.removeAllListeners('state');
    ipc.removeAllListeners('async-request');
    ipc.removeAllListeners('async-response');
    ipc.removeAllListeners('get-state');
  }
}
