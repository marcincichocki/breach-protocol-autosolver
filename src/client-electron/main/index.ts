import { app, globalShortcut, ipcMain as ipc } from 'electron';
import { Store } from './store';
import { createBrowserWindows } from './windows';

async function main() {
  await app.whenReady();

  const { worker, renderer } = createBrowserWindows();
  const store = new Store(worker.webContents, renderer.webContents);

  renderer.on('closed', () => {
    store.dispose();
    globalShortcut.unregisterAll();

    app.quit();
  });

  ipc.on('app-close', () => {
    renderer.close();
  });

  ipc.on('app-minimize', () => {
    renderer.minimize();
  });

  ipc.on('app-maximize', () => {
    if (renderer.isMaximized()) {
      renderer.unmaximize();
    } else {
      renderer.maximize();
    }
  });

  ipc.on('renderer:key-bind-change', (e, keyBind) => {
    globalShortcut.unregisterAll();
    globalShortcut.register(keyBind, onWorkerSolve);
  });

  ipc.once('worker:ready', () => {
    const { keyBind } = store.getState().settings;

    globalShortcut.register(keyBind, onWorkerSolve);
  });

  function onWorkerSolve() {
    worker.webContents.send('worker:solve');
  }
}

main();
