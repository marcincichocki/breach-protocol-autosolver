import { dialog, MessageBoxOptions } from 'electron';
import { NativeDialog } from '../common';

class MainNativeDialog extends NativeDialog {
  protected showMessageBox(options: MessageBoxOptions) {
    return dialog.showMessageBox(options);
  }
}

export const nativeDialog = new MainNativeDialog();
