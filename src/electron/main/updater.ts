import type Electron from 'electron';
import { clear } from 'electron-first-run';
import { autoUpdater, ProgressInfo, UpdateInfo } from 'electron-updater';
import {
  SetStatusAction,
  SetUpdateStatusAction,
  UpdateStatus,
  WorkerStatus,
} from '../common';
import { Store } from './store/store';

export class BreachProtocolAutosolverUpdater {
  private autoUpdate: boolean = null;
  private status: UpdateStatus;

  private wereReleseNotesShown = false;

  constructor(
    private store: Store,
    private renderer: Electron.WebContents,
    private readonly isFirstRun: boolean
  ) {
    this.registerListeners();
  }

  async checkForUpdates() {
    this.autoUpdate = this.store.getState().settings.autoUpdate;
    autoUpdater.autoDownload = this.autoUpdate;

    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      if (error instanceof Error) {
        this.onError(error);
      } else {
        throw error;
      }
    }
  }

  downloadUpdate() {
    if (this.status !== UpdateStatus.UpdateAvailable) {
      throw new Error('There is not update to download.');
    }

    autoUpdater.downloadUpdate();

    this.disableWorker();
    this.setUpdateStatus(UpdateStatus.Downloading);
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

  private onError(error: Error) {
    if (error.message === 'net::ERR_INTERNET_DISCONNECTED') {
      this.setUpdateStatus(UpdateStatus.NetworkError);
    } else {
      this.setUpdateStatus(UpdateStatus.Error);
    }
  }

  private onCheckingForUpdates() {
    this.setUpdateStatus(UpdateStatus.CheckingForUpdate);
  }

  private async onUpdateAvailable(info: UpdateInfo) {
    this.setUpdateStatus(UpdateStatus.UpdateAvailable);

    if (!this.autoUpdate) {
      this.renderer.send('renderer:show-release-notes', info);
    } else {
      this.downloadUpdate();
    }
  }

  private onUpdateNotAvailable(info: UpdateInfo) {
    if (this.isFirstRun && !this.wereReleseNotesShown) {
      this.renderer.send('renderer:show-release-notes', info);
      this.wereReleseNotesShown = true;
    }

    this.setUpdateStatus(UpdateStatus.UpdateNotAvailable);
  }

  private onUpdateDownloaded() {
    this.setUpdateStatus(UpdateStatus.UpdateDownloaded);

    clear({ name: 'update' });
    autoUpdater.quitAndInstall();
  }

  private onDownloadProgress(info: ProgressInfo) {
    this.renderer.send('renderer:download-progress', info);
  }

  private disableWorker() {
    const action = new SetStatusAction(WorkerStatus.Disabled);

    return this.store.dispatch(action, true);
  }

  private setUpdateStatus(status: UpdateStatus) {
    this.status = status;
    const action = new SetUpdateStatusAction(status);

    return this.store.dispatch(action, true);
  }
}
