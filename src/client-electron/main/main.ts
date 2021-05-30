import { app, globalShortcut, ipcMain as ipc, Menu, shell } from 'electron';
import { Store } from './store';
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

  init() {
    const { worker, renderer } = createBrowserWindows();
    this.store = new Store(worker.webContents, renderer.webContents);

    this.renderer = renderer;
    this.worker = worker;

    this.registerListeners();
  }

  private registerListeners() {
    ipc.on('renderer:close', this.onAppClose.bind(this));
    ipc.on('renderer:minimize', this.onAppMinimize.bind(this));
    ipc.on('renderer:maximize', this.onAppMaximize.bind(this));
    ipc.on('renderer:show-help-menu', this.onShowHelpMenu.bind(this));
    ipc.on('renderer:key-bind-change', this.onKeyBindChange.bind(this));

    // Start listening on keybind when worker is fully loaded.
    ipc.once('worker:ready', this.onWorkerReady.bind(this));

    this.renderer.once('closed', this.onRendererClosed.bind(this));
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
