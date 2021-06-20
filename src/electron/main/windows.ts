import { isDev } from '@/common';
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import isWsl from 'is-wsl';
import { join } from 'path';
import icon from '../../../resources/icon.png';

function createWindow(name: string, options: BrowserWindowConstructorOptions) {
  const window = new BrowserWindow(options);

  window.loadFile(join(__dirname, `./${name}.html`));

  return window;
}

const workerOptions: BrowserWindowConstructorOptions = {
  show: false,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    backgroundThrottling: false,
  },
};

const rendererOptions: BrowserWindowConstructorOptions = {
  show: false,
  minWidth: 1280,
  minHeight: 720,
  // Maximize and drag does not work on wsl2.
  frame: isDev && isWsl,
  icon: join(__dirname, icon),
  autoHideMenuBar: true,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  },
};

export function createBrowserWindows() {
  const worker = createWindow('worker', workerOptions);
  const renderer = createWindow('renderer', rendererOptions);

  if (isDev) {
    renderer.webContents.openDevTools();
  }

  return { worker, renderer };
}
