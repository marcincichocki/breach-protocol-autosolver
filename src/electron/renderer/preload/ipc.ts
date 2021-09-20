import type { Action, State } from '@/electron/common';
import { ipcRenderer } from 'electron';

const onChannels = [
  'main:show-release-notes',
  'main:download-progress',
  'main:third-party-licenses',
  'SET_SETTINGS',
  'UPDATE_SETTINGS',
  'ADD_HISTORY_ENTRY',
  'REMOVE_HISTORY_ENTRY',
  'state',
  'async-response',
] as const;

export type IpcOnChannels = typeof onChannels[number];

const invokeChannels = [
  'renderer:show-message-box',
  'renderer:validate-key-bind',
] as const;

export type IpcInvokeChannels = typeof invokeChannels[number];

const sendChannels = [
  'renderer:show-help-menu',
  'renderer:minimize',
  'renderer:maximize',
  'renderer:close',
  'renderer:key-bind-change',
  'renderer:save-snapshot',
  'async-request',
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
export function on(
  channel: IpcOnChannels,
  listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
) {
  validateChannel(channel, onChannels);

  ipcRenderer.on(channel, listener);
}

/** Wrapper around {@link ipcRenderer.send}. Accepts only curated list of channels. */
export function send(channel: IpcSendChannels, ...args: any[]) {
  validateChannel(channel, sendChannels);

  ipcRenderer.send(channel, ...args);
}

/** Wrapper around {@link ipcRenderer.invoke}. Accepts only curated list of channels. */
export function invoke(channel: IpcInvokeChannels, ...args: any[]) {
  validateChannel(channel, invokeChannels);

  return ipcRenderer.invoke(channel, ...args);
}

/** Wrapper around {@link ipcRenderer.removeListener}. Accepts only curated list of channels. */
export function removeListener(
  channel: string,
  listener: (...args: any[]) => void
) {
  validateChannel(channel, onChannels);

  ipcRenderer.removeListener(channel, listener);
}

export function getState(): State {
  return ipcRenderer.sendSync('get-state');
}

export function dispatch(action: Action) {
  ipcRenderer.send('state', action);
}
