import { format, formatDistanceToNow } from 'date-fns';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { State } from '../common';
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

export function getDistance(timestamp: number) {
  const time = format(timestamp, 'HH:mm:ss');
  const distance = formatDistanceToNow(timestamp, { addSuffix: true });

  return `${time} - ${distance}`;
}

export function useIpcEvent<T>(
  channel: string,
  callback: (event: IpcRendererEvent, value: T) => void
) {
  useEffect(() => {
    ipc.on(channel, callback);

    return () => {
      ipc.removeListener(channel, callback);
    };
  }, []);
}

export function useIpcState() {
  const [state, setState] = useState<State>(ipc.sendSync('get-state'));

  function handleEvent(e: IpcRendererEvent, newState: State) {
    setState(newState);
  }

  useIpcEvent('state', handleEvent);

  return state;
}
