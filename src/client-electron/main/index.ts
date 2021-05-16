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

  ipc.once('worker:ready', () => {
    globalShortcut.register('CommandOrControl+numdec', () => {
      worker.webContents.send('worker:solve');
    });
  });
}

main();
