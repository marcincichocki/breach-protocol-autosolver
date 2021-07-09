import { Action, State } from '@/electron/common';
import { format, formatDistanceToNow } from 'date-fns';
import { ipcRenderer as ipc, IpcRendererEvent } from 'electron';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ScreenshotDisplayOutput } from 'screenshot-desktop';
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

export function useHistoryRedirect(channels: string[]) {
  const history = useHistory();

  useIpcEvent(channels, () => history.replace('/history'));
}

export class NativeDialog {
  static async confirm(options: Electron.MessageBoxOptions) {
    const defaultOptions: Partial<Electron.MessageBoxOptions> = {
      title: 'Confirm',
      defaultId: 0,
      cancelId: 1,
      noLink: true,
      type: 'warning',
      buttons: ['Ok', 'Cancel'],
    };
    const { response } = await NativeDialog.showMessageBox({
      ...defaultOptions,
      ...options,
    });

    return !response;
  }

  static async alert(options?: Electron.MessageBoxOptions) {
    const defaultOptions: Partial<Electron.MessageBoxOptions> = {
      noLink: true,
      defaultId: 0,
      title: 'Alert',
      type: 'warning',
      buttons: ['Ok'],
    };

    return NativeDialog.showMessageBox({
      ...defaultOptions,
      ...options,
    });
  }

  private static showMessageBox(
    options: Electron.MessageBoxOptions
  ): Promise<Electron.MessageBoxReturnValue> {
    return ipc.invoke('renderer:show-message-box', options);
  }
}
