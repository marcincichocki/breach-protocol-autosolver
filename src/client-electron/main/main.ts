import {
  app,
  dialog,
  globalShortcut,
  ipcMain as ipc,
  Menu,
  shell,
  Tray,
} from 'electron';
import { copyFileSync, ensureDirSync, remove, writeJSONSync } from 'fs-extra';
import { extname, join } from 'path';
import { ActionTypes } from '../actions';
import { Action } from '../common';
import icon from '../renderer/assets/icon.png';
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
      label: 'Homepage',
      click() {
        shell.openExternal(process.env.npm_package_homepage);
      },
    },
    { type: 'separator' },
    {
      label: 'Report bug',
      click() {
        shell.openExternal(process.env.npm_package_bugs_url);
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

    this.attachStoreMiddlewares();

    this.renderer = renderer;
    this.worker = worker;

    this.registerListeners();
  }

  private attachStoreMiddlewares() {
    if (process.env.NODE_ENV === 'development') {
      this.store.attachMiddleware(console.log);
    }

    this.store.attachMiddleware(this.removeLastHistoryEntry.bind(this));
  }

  private removeLastHistoryEntry(action: Action) {
    if (action.type === ActionTypes.ADD_HISTORY_ENTRY) {
      const { history, settings } = this.store.getState();
      const { length } = history;

      if (length >= settings.historySize) {
        const lastHistoryEntry = history[length - 1];

        if (lastHistoryEntry.fileName) {
          remove(lastHistoryEntry.fileName);
        }

        this.store.dispatch({
          type: ActionTypes.REMOVE_LAST_HISTORY_ENTRY,
          origin: 'worker',
        });
      }
    }
  }

  private createTray() {
    const tray = new Tray(join(__dirname, icon));
    const contextMenu = Menu.buildFromTemplate(this.trayMenu);

    tray.on('double-click', () => {
      this.renderer.show();
    });
    tray.setToolTip(process.env.npm_package_build_productName);
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
    this.worker.webContents.send('worker:solve', app.getPath('userData'));
  }

  private onKeyBindChange(
    e: Electron.IpcMainEvent,
    keyBind: Electron.Accelerator
  ) {
    globalShortcut.unregisterAll();

    this.registerKeyBind(keyBind);
  }

  private async onSaveSnapshot(e: Electron.IpcMain, entryId: string) {
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
}
