import { app, BrowserWindow, globalShortcut, ipcMain as ipc } from 'electron';
import { join } from 'path';

function createRendererWindow() {
  const window = new BrowserWindow({
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.webContents.openDevTools();
  window.loadFile(join(__dirname, './renderer.html'));

  return window;
}

function createWorkerWindow() {
  const window = new BrowserWindow({
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
  });

  window.loadFile(join(__dirname, './worker.html'));

  return window;
}

async function main() {
  await app.whenReady();

  const window = createRendererWindow();
  const worker = createWorkerWindow();

  window.on('closed', () => app.exit());

  ipc.once('worker:ready', () => {
    window.webContents.send('worker:ready');

    globalShortcut.register('CommandOrControl+numdec', () => {
      worker.webContents.send('worker:solve');
    });
  });
}

main();

ipc.on('before-exit', () => {
  globalShortcut.unregisterAll();
});
