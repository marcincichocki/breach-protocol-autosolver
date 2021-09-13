import { dialog } from 'electron';
import { NativeDialog } from '../common';

class MainNativeDialog extends NativeDialog {
  protected showMessageBox(options: Electron.MessageBoxOptions) {
    return dialog.showMessageBox(options);
  }
}

export const nativeDialog = new MainNativeDialog();
