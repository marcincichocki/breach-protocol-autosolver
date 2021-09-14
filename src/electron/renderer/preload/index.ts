import { contextBridge } from 'electron';
import * as ipc from './ipc';
import * as node from './node';
import * as shell from './shell';

const api = {
  ...ipc,
  ...shell,
  ...node,
};

export type PreloadApi = typeof api;

contextBridge.exposeInMainWorld('api', api);
