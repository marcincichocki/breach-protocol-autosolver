import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';

function createWindow(name: string, options: BrowserWindowConstructorOptions) {
  const window = new BrowserWindow(options);

  window.loadFile(join(__dirname, `./${name}.html`));

  return window;
}

const workerOptions = {
  show: false,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    backgroundThrottling: false,
  },
};

const rendererOptions = {
  minWidth: 1280,
  minHeight: 720,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
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
