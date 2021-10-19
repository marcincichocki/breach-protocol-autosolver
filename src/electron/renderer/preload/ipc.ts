import { Action, ActionTypes, State } from '@/electron/common';
import { ipcRenderer } from 'electron';

const onChannels = [
  'renderer:show-release-notes',
  'renderer:download-progress',
  'renderer:third-party-licenses',
  'renderer:state',
  'renderer:async-response',
  ActionTypes.UPDATE_SETTINGS,
  ActionTypes.ADD_HISTORY_ENTRY,
  ActionTypes.REMOVE_HISTORY_ENTRY,
  ActionTypes.SET_ANALYSIS,
] as const;

export type IpcOnChannels = typeof onChannels[number];

const invokeChannels = [
  'main:show-message-box',
  'main:validate-key-bind',
  'main:validate-file',
] as const;

export type IpcInvokeChannels = typeof invokeChannels[number];

const sendChannels = [
  'main:show-help-menu',
  'main:minimize',
  'main:maximize',
  'main:close',
  'main:key-bind-change',
  'main:save-snapshot',
  'main:async-request',
] as const;

export type IpcSendChannels = typeof sendChannels[number];

function getInvalidChannelError(channel: string) {
  return new Error(`Invalid channel "${channel}" provided.`);
}

function validateChannel(input: string, whitelist: readonly string[]) {
  if (!whitelist.includes(input)) {
    throw getInvalidChannelError(input);
  }
}

/** Wrapper around {@link ipcRenderer.on}. Accepts only curated list of channels. */
export function on(channel: IpcOnChannels, listener: (...args: any[]) => void) {
  validateChannel(channel, onChannels);

  // Intentionally remove event from parameters.
  const safeListener = (e: any, ...args: any[]) => listener(...args);

  ipcRenderer.on(channel, safeListener);

  return () => {
    // Function passed to preload will be wrapped in a proxy and its
    // reference will be lost. Creating local version of the listener will
    // allow to free memory later on.
    ipcRenderer.removeListener(channel, safeListener);
  };
}

/** Wrapper around {@link ipcRenderer.send}. Accepts only curated list of channels. */
export function send(channel: IpcSendChannels, ...args: any[]) {
  validateChannel(channel, sendChannels);

  ipcRenderer.send(channel, ...args);
}

/** Wrapper around {@link ipcRenderer.invoke}. Accepts only curated list of channels. */
export function invoke<T = any>(channel: IpcInvokeChannels, ...args: any[]) {
  validateChannel(channel, invokeChannels);

  return ipcRenderer.invoke(channel, ...args) as Promise<T>;
}

export function getState(): State {
  return ipcRenderer.sendSync('main:get-state');
}

export function dispatch(action: Action) {
  ipcRenderer.send('main:state', action);
}
