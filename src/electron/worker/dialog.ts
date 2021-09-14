import { ipcRenderer as ipc } from 'electron';
import { NativeDialog } from '../common';

class WorkerNativeDialog extends NativeDialog {
  showMessageBox(options: Electron.MessageBoxOptions) {
    return ipc.invoke('renderer:show-message-box', options);
  }
}

export const nativeDialog = new WorkerNativeDialog();
