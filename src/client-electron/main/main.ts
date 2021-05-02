import { app, globalShortcut, ipcMain as ipc } from 'electron';
import { Store } from './store';
import { createBrowserWindows } from './windows';

async function main() {
  await app.whenReady();

  const { worker, renderer } = createBrowserWindows();
  const store = new Store(worker.webContents, renderer.webContents);

  renderer.on('closed', () => app.exit());

  ipc.once('worker:ready', () => {
    globalShortcut.register('CommandOrControl+numdec', () => {
      worker.webContents.send('worker:solve');
    });
  });

  ipc.on('before-exit', () => {
    store.dispose();

    globalShortcut.unregisterAll();
  });
}

main();
