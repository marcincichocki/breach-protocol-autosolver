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
  show: true,
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
  frame: process.env.NODE_ENV === 'development' && isWsl,
  icon: join(__dirname, icon),
  autoHideMenuBar: true,
  webPreferences: {
    preload: join(__dirname, 'preload.js'),
  },
};

export function createBrowserWindows() {
  const worker = createWindow('worker', workerOptions);
  const renderer = createWindow('renderer', rendererOptions);

  if (process.env.NODE_ENV === 'development') {
    renderer.webContents.openDevTools();
  }

  return { worker, renderer };
}
