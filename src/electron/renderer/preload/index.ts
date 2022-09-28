import { contextBridge, clipboard } from 'electron';
import * as ipc from './ipc';
import * as node from './node';
import * as shell from './shell';

function copy(text: string) {
  clipboard.writeText(text);
}

const api = {
  ...ipc,
  ...shell,
  ...node,
  copy,
};

export type PreloadApi = typeof api;

contextBridge.exposeInMainWorld('api', api);
