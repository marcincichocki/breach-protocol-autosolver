import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import isWsl from 'is-wsl';
import { join } from 'path';

const isDev = process.env.NODE_ENV === 'development';

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
  frame: isDev && isWsl ? true : false,
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
