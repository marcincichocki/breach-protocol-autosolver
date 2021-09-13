import { contextBridge, ipcRenderer, shell } from 'electron';
import { basename } from 'path';
import type { Action } from '../common';

const utils = {
  basename,
};

// whitelisted events that renderer can send
const channels = [
  'renderer:show-help-menu',
  'renderer:minimize',
  'renderer:maximize',
  'renderer:close',
  'renderer:key-bind-change',
  'renderer:save-snapshot',
  'renderer:show-message-box',
  'async-request',
  'async-response',
];

const api: any = {
  on(channel: string, callback: () => void) {
    console.log(channel);

    ipcRenderer.on(channel, callback);
  },
  send(channel: string, ...args: any) {
    if (!channels.includes(channel)) {
      return;
    }

    return ipcRenderer.send(channel, ...args);
  },
  invoke(channel: string, ...args: any) {
    if (!channels.includes(channel)) {
      return;
    }

    return ipcRenderer.invoke(channel, ...args);
  },
  removeListener: ipcRenderer.removeListener,
  getState() {
    return ipcRenderer.sendSync('get-state');
  },
  dispatch(action: Action) {
    return ipcRenderer.send('state', action);
  },
  // validate url/whitelist?
  openLinkInBrowser(url: string) {
    return shell.openExternal(url);
  },
  showItemInFolder: shell.showItemInFolder,

  utils,
};

contextBridge.exposeInMainWorld('api', api);
