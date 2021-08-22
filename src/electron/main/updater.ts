import { autoUpdater, ProgressInfo, UpdateInfo } from 'electron-updater';
import {
  NativeDialog,
  SetStatusAction,
  SetUpdateStatusAction,
  UpdateStatus,
  WorkerStatus,
} from '../common';
import { Store } from './store/store';

export class BreachProtocolAutosolverUpdater {
  autoUpdate: boolean = null;

  constructor(private store: Store, private renderer: Electron.webContents) {
    this.registerListeners();
  }

  checkForUpdates() {
    this.autoUpdate = this.store.getState().settings.autoUpdate;
    autoUpdater.autoDownload = this.autoUpdate;

    autoUpdater.checkForUpdates();
  }

  dispose() {
    autoUpdater.removeAllListeners();
  }

  private registerListeners() {
    autoUpdater.on('checking-for-update', this.onCheckingForUpdates.bind(this));
    autoUpdater.on('update-available', this.onUpdateAvailable.bind(this));
    autoUpdater.on(
      'update-not-available',
      this.onUpdateNotAvailable.bind(this)
    );
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this));
    autoUpdater.on('download-progress', this.onDownloadProgress.bind(this));
  }

  private onCheckingForUpdates() {
    this.setUpdateStatus(UpdateStatus.CheckingForUpdate);
  }

  private async onUpdateAvailable({ version }: UpdateInfo) {
    this.setUpdateStatus(UpdateStatus.UpdateAvailable);

    if (!this.autoUpdate) {
      const result = await NativeDialog.confirm({
        message: `New version ${version} available.`,
        buttons: ['Download and install', 'Cancel'],
        type: 'info',
      });

      if (!result) return;

      autoUpdater.downloadUpdate();
    }

    this.store.dispatch(new SetStatusAction(WorkerStatus.Disabled), true);
    this.setUpdateStatus(UpdateStatus.Downloading);
  }

  private onUpdateNotAvailable() {
    this.setUpdateStatus(UpdateStatus.UpdateNotAvailable);
  }

  private onUpdateDownloaded() {
    this.setUpdateStatus(UpdateStatus.UpdateDownloaded);

    autoUpdater.quitAndInstall();
  }

  private onDownloadProgress(info: ProgressInfo) {
    this.renderer.send('download-progress', info);
  }

  private setUpdateStatus(status: UpdateStatus) {
    const action = new SetUpdateStatusAction(status);

    return this.store.dispatch(action, true);
  }
}
