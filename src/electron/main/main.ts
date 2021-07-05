import {
  app,
  clipboard,
  dialog,
  globalShortcut,
  ipcMain as ipc,
  Menu,
  shell,
  Tray,
} from 'electron';
import { copyFileSync, ensureDirSync, remove, writeJSONSync } from 'fs-extra';
import { extname, join } from 'path';
import icon from '../../../resources/icon.png';
import { Store } from './store/store';
import { createBrowserWindows } from './windows';

export class Main {
  /** Centralized store, holds state of the application. */
  private store: Store = null;

  /** Main app window, contains react app. */
  private renderer: Electron.BrowserWindow = null;

  /** Hidden "worker" window, does all the heavy lifting(ocr, solving). */
  private worker: Electron.BrowserWindow = null;

  private helpMenuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'About',
      click: () => {
        this.showAboutDialog();
      },
    },
    {
      label: 'Homepage',
      click() {
        shell.openExternal(HOMEPAGE_URL);
      },
    },
    { type: 'separator' },
    {
      label: 'Third-party licenses',
      click() {
        const licensesFileName = 'THIRD_PARTY_LICENSES.txt';
        const licensesPath =
          process.env.NODE_ENV === 'production'
            ? join('..', licensesFileName)
            : licensesFileName;

        shell.showItemInFolder(join(app.getAppPath(), licensesPath));
      },
    },
    { type: 'separator' },
    {
      label: 'Report bug',
      click() {
        shell.openExternal(BUGS_URL);
      },
    },
  ];

  private trayMenu: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Show',
      click: () => {
        this.renderer.show();
      },
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        this.renderer.close();
      },
    },
  ];

  tray: Electron.Tray;

  init() {
    const { worker, renderer } = createBrowserWindows();
    this.store = new Store(worker.webContents, renderer.webContents);

    this.renderer = renderer;
    this.worker = worker;

    this.registerListeners();
  }

  private createTray() {
    const tray = new Tray(join(__dirname, icon));
    const contextMenu = Menu.buildFromTemplate(this.trayMenu);

    tray.on('double-click', () => {
      this.renderer.show();
    });
    tray.setToolTip(PRODUCT_NAME);
    tray.setContextMenu(contextMenu);

    return tray;
  }

  private registerListeners() {
    ipc.on('renderer:close', this.onAppClose.bind(this));
    ipc.on('renderer:minimize', this.onAppMinimize.bind(this));
    ipc.on('renderer:maximize', this.onAppMaximize.bind(this));
    ipc.on('renderer:show-help-menu', this.onShowHelpMenu.bind(this));
    ipc.on('renderer:key-bind-change', this.onKeyBindChange.bind(this));
    ipc.on('renderer:save-snapshot', this.onSaveSnapshot.bind(this));
    ipc.handle('renderer:show-message-box', this.onShowMessageBox);

    // Start listening on keybind when worker is fully loaded.
    ipc.once('worker:ready', this.onWorkerReady.bind(this));

    this.renderer.once('ready-to-show', () => this.renderer.show());
    this.renderer.once('closed', this.onRendererClosed.bind(this));
    this.renderer.on('minimize', this.onRendererMinimize.bind(this));
    this.renderer.on('restore', this.onRendererRestore.bind(this));
  }

  private onRendererMinimize(event: Electron.Event) {
    if (!this.getSettings().minimizeToTray) {
      return;
    }

    event.preventDefault();

    this.tray = this.createTray();

    this.renderer.setSkipTaskbar(true);
    this.renderer.hide();
  }

  private onRendererRestore() {
    if (!this.getSettings().minimizeToTray) {
      return;
    }

    this.renderer.show();
    this.renderer.setSkipTaskbar(false);

    this.tray.destroy();
  }

  private removeAllListeners() {
    ipc.removeAllListeners();

    this.renderer.removeAllListeners();
    this.worker.removeAllListeners();

    globalShortcut.unregisterAll();
  }

  private registerKeyBind(keyBind: Electron.Accelerator) {
    globalShortcut.register(keyBind, this.onWorkerSolve.bind(this));
  }

  private onWorkerReady() {
    const { keyBind } = this.getSettings();

    this.registerKeyBind(keyBind);
  }

  private onWorkerSolve() {
    this.worker.webContents.send('worker:solve');
  }

  private onKeyBindChange(
    e: Electron.IpcMainEvent,
    keyBind: Electron.Accelerator
  ) {
    globalShortcut.unregisterAll();

    this.registerKeyBind(keyBind);
  }

  private async onSaveSnapshot(e: Electron.IpcMainEvent, entryId: string) {
    const defaultPath = `bpa-snapshot-${entryId}.tgz`;
    const { canceled, filePath } = await dialog.showSaveDialog(this.renderer, {
      defaultPath,
      filters: [{ name: 'Archive', extensions: ['tgz'] }],
    });

    if (canceled) {
      return;
    }

    const entry = this.store.getState().history.find((e) => e.uuid === entryId);
    const tmpPath = join(app.getPath('userData'), 'tmp');
    const tmpEntryPath = join(tmpPath, 'entry.json');

    ensureDirSync(tmpPath);
    writeJSONSync(tmpEntryPath, entry);

    if (entry.fileName) {
      const tmpSourcePath = join(tmpPath, `source${extname(entry.fileName)}`);

      copyFileSync(entry.fileName, tmpSourcePath);
    }

    const { default: tar } = await import('tar');

    await tar.create({ gzip: true, file: filePath, cwd: tmpPath }, ['./']);

    remove(tmpPath);
  }

  private onShowMessageBox(
    e: Electron.IpcMainEvent,
    options: Electron.MessageBoxOptions
  ) {
    return dialog.showMessageBox(options);
  }

  private onShowHelpMenu() {
    const menu = Menu.buildFromTemplate(this.helpMenuTemplate);

    menu.popup();
  }

  private onRendererClosed() {
    this.store.dispose();
    this.store = null;

    this.removeAllListeners();

    app.quit();
  }

  private onAppClose() {
    this.renderer.close();
  }

  private onAppMinimize() {
    this.renderer.minimize();
  }

  private onAppMaximize() {
    if (this.renderer.isMaximized()) {
      this.renderer.unmaximize();
    } else {
      this.renderer.maximize();
    }
  }

  private getSettings() {
    return this.store.getState().settings;
  }

  private async showAboutDialog() {
    const os = await import('os');
    const detail = [
      `Version: ${VERSION}`,
      `Commit: ${GIT_COMMIT_SHA}`,
      `Date: ${new Date(GIT_COMMIT_DATE)}`,
      `Electron: ${process.versions.electron}`,
      `Chrome: ${process.versions.chrome}`,
      `Node.js: ${process.versions.node}`,
      `V8: ${process.versions.v8}`,
      `OS: ${os.version()} ${os.release()}`,
    ].join('\n');

    const { response } = await dialog.showMessageBox(this.renderer, {
      type: 'info',
      title: 'About',
      message: PRODUCT_NAME,
      detail,
      buttons: ['Ok', 'Copy'],
      noLink: true,
      cancelId: 0,
    });

    if (response === 1) {
      clipboard.writeText(detail);
    }
  }
}
