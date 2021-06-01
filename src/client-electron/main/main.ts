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
      click() {
        this.renderer.show();
      },
    },
    {
      label: 'Exit',
      click() {
        app.quit();
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
    let appIcon = new Tray(join(__dirname, icon));
    const contextMenu = Menu.buildFromTemplate(this.trayMenu);

    appIcon.on('double-click', () => {
      this.renderer.show();
    });
    appIcon.setToolTip('Breach Protocol Autosolver');
    appIcon.setContextMenu(contextMenu);

    return appIcon;
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
    this.renderer.on('minimize', (event: Electron.Event) => {
      event.preventDefault();

      this.tray = this.createTray();

      this.renderer.setSkipTaskbar(true);
      this.renderer.hide();
    });

    this.renderer.on('restore', () => {
      this.renderer.show();
      this.renderer.setSkipTaskbar(false);

      this.tray.destroy();
    });
  }

  private removeAllListeners() {
    ipc.removeAllListeners();
  }

  private registerKeyBind(keyBind: Electron.Accelerator) {
    globalShortcut.register(keyBind, this.onWorkerSolve.bind(this));
  }

  private onWorkerReady() {
    const { keyBind } = this.store.getState().settings;

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

    globalShortcut.unregisterAll();

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
}
