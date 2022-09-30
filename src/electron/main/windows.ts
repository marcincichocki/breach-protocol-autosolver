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

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

const rendererOptions: BrowserWindowConstructorOptions = {
  show: false,
  minWidth: DEFAULT_WIDTH,
  minHeight: DEFAULT_HEIGHT,
  // In dev mode make more space for docked devtools.
  width: process.env.NODE_ENV === 'development' ? 2000 : DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  // Maximize and drag does not work on wsl2.
  frame: process.env.NODE_ENV === 'development' && isWsl,
  icon: join(__dirname, icon),
  autoHideMenuBar: true,
  webPreferences: {
    preload: join(__dirname, 'preload.js'),
    sandbox: false,
  },
};

export function createBrowserWindows() {
  const worker = createWindow('worker', workerOptions);
  const renderer = createWindow('renderer', rendererOptions);

  return { worker, renderer };
}
