import {
  Action,
  NativeDialog,
  Request,
  Response,
  SetStatusAction,
  State,
  WorkerStatus,
} from '@/electron/common';
import { format, formatDistanceToNow } from 'date-fns';
import type { IpcRendererEvent } from 'electron';
import { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ScreenshotDisplayOutput } from 'screenshot-desktop';
import { v4 as uuidv4 } from 'uuid';
import type { IpcOnChannels } from './preload/ipc';
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
  channels: IpcOnChannels[],
  callback: (event: IpcRendererEvent, value: T) => void
) {
  useEffect(() => {
    channels.forEach((c) => {
      api.on(c, callback);
    });

    return () => {
      channels.forEach((c) => {
        api.removeListener(c, callback);
      });
    };
  }, []);
}

export function useIpcEventDialog<T>(channel: IpcOnChannels) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T>(null);
  const close = () => setIsOpen(false);

  useIpcEvent([channel], (e, data: T) => {
    setData(data);
    setIsOpen(true);
  });

  return { isOpen, data, close };
}

export function useIpcState() {
  const [state, setState] = useState<State>(api.getState());

  function handleEvent(e: IpcRendererEvent, { payload }: Action<State>) {
    setState(payload);
  }

  useIpcEvent(['state'], handleEvent);

  return state;
}

export function getDisplayName(display: ScreenshotDisplayOutput) {
  return `${display.name} (${display.width}x${display.height})`;
}

export function useHistoryRedirect(channels: IpcOnChannels[]) {
  const history = useHistory();

  useIpcEvent(channels, () => history.replace('/history'));
}

export function createRootElement(id: string) {
  const root = document.createElement('div');
  root.id = id;
  document.body.appendChild(root);

  return root;
}

class RendererNativeDialog extends NativeDialog {
  protected showMessageBox(options: Electron.MessageBoxOptions) {
    return api.invoke('renderer:show-message-box', options);
  }
}

export const nativeDialog = new RendererNativeDialog();

export function asyncRequestDispatcher<TRes, TReq = any>(
  action: Omit<Request<TReq>, 'origin' | 'uuid'>
) {
  return new Promise<TRes>((resolve) => {
    const uuid = uuidv4();
    const req: Request<TReq> = { ...action, origin: 'renderer', uuid };

    function onAsyncResponse(e: IpcRendererEvent, res: Response<TRes>) {
      if (res.uuid !== uuid) return;

      api.removeListener('async-response', onAsyncResponse);

      resolve(res.data);
    }

    api.on('async-response', onAsyncResponse);
    api.send('async-request', req);
  });
}

export function updateWorkerStatus(status: WorkerStatus) {
  api.dispatch(new SetStatusAction(status, 'renderer'));
}
