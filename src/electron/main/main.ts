import {
  Accelerator,
  app,
  BrowserWindow,
  clipboard,
  dialog,
  ipcMain as ipc,
  IpcMainEvent,
  Menu,
  MenuItemConstructorOptions,
  MessageBoxOptions,
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
  AnalysisInput,
  BreachProtocolCommands,
  BreachProtocolKeyBinds,
  COMMANDS,
  DropZoneFileValidationErrors,
  KEY_BINDS,
  PackageDetails,
  UpdateSettingsAction,
  WorkerStatus,
} from '../common';
import { CommandManager } from './command-manager';
import { nativeDialog } from './dialog';
import { KeyBindManager } from './key-bind-manager';
import { Store } from './store/store';
import { BreachProtocolAutosolverUpdater } from './updater';
import { createBrowserWindows } from './windows';

export class Main {
  /** Centralized store, holds state of the application. */
  private store: Store = null;

  /** Main app window, contains react app. */
  private renderer: BrowserWindow = null;

  /** Hidden "worker" window, does all the heavy lifting(ocr, solving). */
  private worker: BrowserWindow = null;

  /** Worker devtools. */
  private devtools: BrowserWindow = null;

  private updater: BreachProtocolAutosolverUpdater = null;

  private readonly commandManager = this.registerCommands();

  private readonly keyBindManager = new KeyBindManager<BreachProtocolCommands>(
    this.commandManager
  );

  private readonly isFirstRun = firstRun({ name: 'update' });

  /** Only allow to externally open websites from this list. */
  private readonly originWhitelist = ['https://github.com'];

  private menu = Menu.buildFromTemplate([
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
      label: 'Analyze',
      submenu: [
        {
          label: 'From file',
          click: this.analyzeFromFile.bind(this),
          accelerator: 'CommandOrControl+Shift+O',
        },
        {
          label: 'From clipboard',
          click: this.analyzeFromClipboard.bind(this),
          accelerator: 'CommandOrControl+Shift+V',
        },
      ],
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
  ]);

  private trayMenu: MenuItemConstructorOptions[] = [
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

  tray: Tray;

  init() {
    if (BUILD_PLATFORM === 'win32') {
      app.setAppUserModelId(APP_ID);
    }

    // Required to register local accelerators.
    Menu.setApplicationMenu(this.menu);

    const { worker, renderer } = createBrowserWindows();
    this.store = new Store(worker.webContents, renderer.webContents, [
      this.toggleKeyBind.bind(this),
    ]);

    this.renderer = renderer;
    this.worker = worker;

    if (process.env.NODE_ENV === 'development') {
      this.openDevTools();
    }

    this.registerKeyBinds();
    this.registerListeners();
  }

  private openDevTools() {
    this.devtools = new BrowserWindow({ autoHideMenuBar: true });
    this.worker.webContents.setDevToolsWebContents(this.devtools.webContents);

    this.worker.webContents.openDevTools({ mode: 'detach' });
    this.renderer.webContents.openDevTools();
  }

  private registerCommands() {
    return new CommandManager<BreachProtocolCommands>()
      .register('worker:solve', () => this.onWorkerSolve())
      .register('worker:solve.withPriority1', () => this.onWorkerSolve(0))
      .register('worker:solve.withPriority2', () => this.onWorkerSolve(1))
      .register('worker:solve.withPriority3', () => this.onWorkerSolve(2))
      .register('worker:solve.withPriority4', () => this.onWorkerSolve(3))
      .register('worker:solve.withPriority5', () => this.onWorkerSolve(4))
      .register('worker:analyze', () => this.onWorkerAnalyze());
  }

  private getKeybindings() {
    // prettier-ignore
    return COMMANDS
      .map((id, i) => ({ id, optionId: KEY_BINDS[i] }))
      .map((ids) => ({ ...ids, accelerator: this.getSettings()[ids.optionId] }));
  }

  private registerKeyBinds() {
    const keybindings = this.getKeybindings();
    const conflicts: BreachProtocolKeyBinds[] = [];

    for (const { accelerator, id, optionId } of keybindings) {
      if (accelerator) {
        const errors = this.keyBindManager.validate(accelerator as string);

        if (!errors) {
          this.keyBindManager.register(id, accelerator);
        } else {
          conflicts.push(optionId);
        }
      }
    }

    if (conflicts.length) {
      const payload = this.getInvalidKeyBindsPayload(conflicts);
      this.store.dispatch(new UpdateSettingsAction(payload), true);

      const message = "Some key bindings couldn't be bound.";
      const detail = 'Visit settings to bind them manually.';

      nativeDialog.alert({ message, detail });
    }
  }

  private getInvalidKeyBindsPayload(conflicts: BreachProtocolKeyBinds[]) {
    const enteries = conflicts.map((id) => [id, ''] as const);

    return Object.fromEntries(enteries) as Record<
      BreachProtocolKeyBinds,
      string
    >;
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
    ipc.on('main:close', this.onAppClose.bind(this));
    ipc.on('main:minimize', this.onAppMinimize.bind(this));
    ipc.on('main:maximize', this.onAppMaximize.bind(this));
    ipc.on('main:show-help-menu', this.onShowHelpMenu.bind(this));
    ipc.on('main:key-bind-change', this.onKeyBindChange.bind(this));
    ipc.on('main:save-snapshot', this.onSaveSnapshot.bind(this));
    ipc.on('main:get-resources-path', this.onGetResourcesPath.bind(this));
    ipc.on('main:focus-renderer', this.showRenderer.bind(this));
    ipc.handle('main:show-message-box', this.onShowMessageBox);
    ipc.handle('main:validate-key-bind', this.onValidateKeyBind.bind(this));
    ipc.handle('main:validate-file', this.onValidateFile.bind(this));

    this.renderer.once('ready-to-show', this.onRendererReadyToShow.bind(this));
    this.renderer.once('closed', this.onRendererClosed.bind(this));
    this.renderer.on('minimize', this.onRendererMinimize.bind(this));
    this.renderer.on('restore', this.onRendererRestore.bind(this));
    this.renderer.webContents.on(
      'will-navigate',
      this.onWillNavigate.bind(this)
    );

    app.on('second-instance', this.showRenderer.bind(this));
  }

  private onValidateFile(
    e: IpcMainEvent,
    mime: string
  ): DropZoneFileValidationErrors {
    const [type, subtype] = mime.split('/');
    const isImage = type === 'image';
    const isSupportedFormat = subtype === 'jpeg' || subtype === 'png';

    return isImage && isSupportedFormat ? null : { isImage, isSupportedFormat };
  }

  private showRenderer() {
    this.renderer.show();
  }

  private onValidateKeyBind(e: IpcMainEvent, input: string) {
    return this.keyBindManager.validate(input);
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

  private onRendererMinimize(event: Event) {
    if (!this.getSettings().minimizeToTray) {
      return;
    }

    event.preventDefault();

    this.tray = this.createTray();

    this.renderer.setSkipTaskbar(true);
  }

  private onRendererRestore() {
    if (!this.getSettings().minimizeToTray) {
      return;
    }

    this.renderer.setSkipTaskbar(false);

    this.tray.destroy();
  }

  private removeAllListeners() {
    ipc.removeAllListeners();

    this.renderer.removeAllListeners();
    this.worker.removeAllListeners();
  }

  private onWorkerAnalyze(file?: AnalysisInput) {
    this.worker.webContents.send('worker:analyze', file);
  }

  private onWorkerSolve(index?: number) {
    this.worker.webContents.send('worker:solve', index);
  }

  private onKeyBindChange(
    e: IpcMainEvent,
    id: BreachProtocolCommands,
    keyBind: Accelerator
  ) {
    if (keyBind) {
      this.keyBindManager.register(id, keyBind);
    } else {
      this.keyBindManager.unregister(id);
    }
  }

  private async onSaveSnapshot(e: IpcMainEvent, entryId: string) {
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

  private onShowMessageBox(e: IpcMainEvent, options: MessageBoxOptions) {
    return dialog.showMessageBox(options);
  }

  private onShowHelpMenu() {
    this.menu.popup();
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

  private onGetResourcesPath(event: IpcMainEvent) {
    event.returnValue = this.getResourcesPath();
  }

  private async analyzeFromFile() {
    const data = await dialog.showOpenDialog(this.renderer, {
      filters: [{ name: 'Image', extensions: ['jpg', 'jpeg', 'png'] }],
      properties: ['openFile'],
      title: 'Analyze breach protocol from file',
    });

    if (data.canceled) return;

    this.onWorkerAnalyze(data.filePaths[0]);
  }

  private async analyzeFromClipboard() {
    const image = clipboard.readImage();

    if (image.isEmpty()) {
      nativeDialog.alert({
        message: 'Clipboard is empty!',
        detail: 'Save breach protocol image to clipboard and try again.',
      });
    } else {
      // Only jpeg is supported at the moment when analyzing from clipboard since
      // png takes 100x times longer to encode it and raw data requires channel info.
      this.onWorkerAnalyze(image.toJPEG(100));
    }
  }

  private async showThridPartyLicesnsesDialog() {
    // License files are autogenerated by webpack plugin and put in output.path.
    const resourcesPath = this.getResourcesPath('./dist');
    const modules = ['main', 'renderer', 'worker', 'preload'];
    const contents = await Promise.all(
      modules.map(this.getLicenseContent(resourcesPath))
    );

    this.renderer.webContents.send(
      'renderer:third-party-licenses',
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
