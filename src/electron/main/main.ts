import {
  app,
  clipboard,
  dialog,
  ipcMain as ipc,
  Menu,
  shell,
  Tray,
} from 'electron';
import firstRun from 'electron-first-run';
import {
  copyFileSync,
  ensureDirSync,
  readJSON,
  remove,
  writeJSONSync,
} from 'fs-extra';
import { extname, join } from 'path';
import { URL } from 'url';
import icon from '../../../resources/icon.png';
import {
  Action,
  ActionTypes,
  BreachProtocolCommands,
  PackageDetails,
  WorkerStatus,
} from '../common';
import { CommandManager } from './command-manager';
import { KeyBindManager } from './key-bind-manager';
import { Store } from './store/store';
import { BreachProtocolAutosolverUpdater } from './updater';
import { createBrowserWindows } from './windows';

export class Main {
  /** Centralized store, holds state of the application. */
  private store: Store = null;

  /** Main app window, contains react app. */
  private renderer: Electron.BrowserWindow = null;

  /** Hidden "worker" window, does all the heavy lifting(ocr, solving). */
  private worker: Electron.BrowserWindow = null;

  private updater: BreachProtocolAutosolverUpdater = null;

  private readonly commandManager = this.registerCommands();

  private readonly keyBindManager = new KeyBindManager<BreachProtocolCommands>(
    this.commandManager
  );

  private readonly isFirstRun = firstRun({ name: 'update' });

  /** Only allow to externally open websites from this list. */
  private readonly originWhitelist = ['https://github.com'];

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
      click: this.showThridPartyLicesnsesDialog.bind(this),
    },
    { type: 'separator' },
    {
      label: 'Report bug',
      click() {
        shell.openExternal(BUGS_URL);
      },
    },
    {
      label: 'Check for updates',
      click: () => {
        this.updater.checkForUpdates();
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
    if (BUILD_PLATFORM === 'win32') {
      app.setAppUserModelId(APP_ID);
    }

    const { worker, renderer } = createBrowserWindows();
    this.store = new Store(worker.webContents, renderer.webContents, [
      this.toggleKeyBind.bind(this),
    ]);

    this.renderer = renderer;
    this.worker = worker;

    this.registerKeyBinds();
    this.registerListeners();
  }

  private registerCommands() {
    return new CommandManager<BreachProtocolCommands>()
      .register('worker:solve', () => this.onWorkerSolve())
      .register('worker:solve.withPriority1', () => this.onWorkerSolve(0))
      .register('worker:solve.withPriority2', () => this.onWorkerSolve(1))
      .register('worker:solve.withPriority3', () => this.onWorkerSolve(2))
      .register('worker:solve.withPriority4', () => this.onWorkerSolve(3))
      .register('worker:solve.withPriority5', () => this.onWorkerSolve(4));
  }

  private registerKeyBinds() {
    const { keyBind } = this.getSettings();

    this.keyBindManager.register('worker:solve', keyBind);
  }

  private async updateApp() {
    const { checkForUpdates } = this.getSettings();
    this.updater = new BreachProtocolAutosolverUpdater(
      this.store,
      this.renderer.webContents,
      this.isFirstRun
    );

    if (checkForUpdates) {
      this.updater.checkForUpdates();
    }
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
    ipc.on('worker:get-resources-path', this.onGetResourcesPath.bind(this));
    ipc.handle('renderer:show-message-box', this.onShowMessageBox);
    ipc.handle('renderer:validate-key-bind', this.onValidateKeyBind.bind(this));

    this.renderer.once('ready-to-show', this.onRendererReadyToShow.bind(this));
    this.renderer.once('closed', this.onRendererClosed.bind(this));
    this.renderer.on('minimize', this.onRendererMinimize.bind(this));
    this.renderer.on('restore', this.onRendererRestore.bind(this));
    this.renderer.webContents.on(
      'will-navigate',
      this.onWillNavigate.bind(this)
    );
  }

  private onValidateKeyBind(e: Electron.IpcMainEvent, input: string) {
    return this.keyBindManager.isValid(input);
  }

  private isUrlAllowed(input: string) {
    const url = new URL(input);

    return this.originWhitelist.includes(url.origin);
  }

  private onWillNavigate(event: Event, url: string) {
    event.preventDefault();

    if (!this.isUrlAllowed(url)) {
      throw new Error(`Invalid url ${url} provided!`);
    }

    return shell.openExternal(url);
  }

  private onRendererReadyToShow() {
    this.renderer.show();
    this.updateApp();
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
  }

  private onWorkerSolve(index?: number) {
    this.worker.webContents.send('worker:solve', index);
  }

  private onKeyBindChange(
    e: Electron.IpcMainEvent,
    keyBind: Electron.Accelerator,
    id: BreachProtocolCommands
  ) {
    this.keyBindManager.changeAcceleratorFor(id, keyBind);
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

    const { default: tar } = await import(/* webpackChunkName: "tar" */ 'tar');

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
    this.keyBindManager.dispose();
    this.commandManager.dispose();
    this.updater.dispose();
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

  private getResourcesPath(fallback: string = './resources') {
    return app.isPackaged ? process.resourcesPath : fallback;
  }

  private onGetResourcesPath(event: Electron.IpcMainEvent) {
    event.returnValue = this.getResourcesPath();
  }

  private async showThridPartyLicesnsesDialog() {
    // License files are autogenerated by webpack plugin and put in output.path.
    const resourcesPath = this.getResourcesPath('./dist');
    const modules = ['main', 'renderer', 'worker', 'preload'];
    const contents = await Promise.all(
      modules.map(this.getLicenseContent(resourcesPath))
    );

    this.renderer.webContents.send(
      'main:third-party-licenses',
      contents.flat()
    );
  }

  private getLicenseContent(resourcesPath: string) {
    return (name: string) => {
      const path = join(resourcesPath, `${name}-licenses.json`);

      return readJSON(path) as Promise<PackageDetails[]>;
    };
  }

  private toggleKeyBind({ type, payload }: Action) {
    if (type === ActionTypes.SET_STATUS) {
      if (payload === WorkerStatus.Disabled) {
        this.keyBindManager.disable();
      } else {
        this.keyBindManager.enable();
      }
    }
  }
}
