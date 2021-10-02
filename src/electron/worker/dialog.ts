import { ipcRenderer as ipc } from 'electron';
import { NativeDialog } from '../common';

class WorkerNativeDialog extends NativeDialog {
  protected showMessageBox(options: Electron.MessageBoxOptions) {
    return ipc.invoke('main:show-message-box', options);
  }
}

export const nativeDialog = new WorkerNativeDialog();
