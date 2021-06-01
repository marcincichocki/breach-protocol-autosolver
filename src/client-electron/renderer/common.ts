import { format, formatDistanceToNow } from 'date-fns';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ScreenshotDisplayOutput } from 'screenshot-desktop';
import { Action, State } from '../common';
import { StateContext } from './state';

/** Return history entry based on entryId url param. */
export function useHistoryEntryFromParam() {
  const { entryId } = useParams<{ entryId: string }>();

  return useHistoryEntry(entryId);
}

export function useHistoryEntry(entryId: string) {
  const { history } = useContext(StateContext);

  return history.find((e) => e.uuid === entryId);
}

const r = /([a-z])([A-Z])/g;

export function fromCamelCase(s: string) {
  return s.replace(r, '$1 $2');
}

// TODO(i18n): add locale
export function transformTimestamp(timestamp: number) {
  const time = format(timestamp, 'pp');
  const distance = formatDistanceToNow(timestamp, {
    addSuffix: true,
  });

  return {
    time,
    distance,
  };
}

export function useIpcEvent<T>(
  channels: string[],
  callback: (event: IpcRendererEvent, value: T) => void
) {
  useEffect(() => {
    channels.forEach((c) => {
      ipc.on(c, callback);
    });

    return () => {
      channels.forEach((c) => {
        ipc.removeListener(c, callback);
      });
    };
  }, []);
}

export function useIpcState() {
  const [state, setState] = useState<State>(ipc.sendSync('get-state'));

  function handleEvent(e: IpcRendererEvent, { payload }: Action<State>) {
    setState(payload);
  }

  useIpcEvent(['state'], handleEvent);

  return state;
}

export function getDisplayName(display: ScreenshotDisplayOutput) {
  return `${display.name} (${display.width}x${display.height})`;
}

export function dispatch(action: Action) {
  return ipc.send('state', action);
}
