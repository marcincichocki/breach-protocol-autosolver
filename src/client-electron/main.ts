import { setLang } from '@/common';
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { join } from 'path';

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
  });

  window.loadFile(
    join(process.cwd(), 'src/client-electron/renderer/index.html')
  );
  window.webContents.openDevTools();

  return window;
}

function createWorkerWindow() {
  const window = new BrowserWindow({
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.webContents.openDevTools();

  window
    .loadFile(join(process.cwd(), 'src/client-electron/worker/index.html'))
    .then(() => console.log('worker window loaded'));

  return window;
}

app.whenReady().then(async () => {
  const rendererWindow = createWindow();
  rendererWindow.on('closed', () => app.quit());

  const worker = createWorkerWindow();

  setLang('en');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  globalShortcut.register('CommandOrControl+NumDec', async () => {
    worker.webContents.send('start-autosolver');
  });
});

ipcMain.on('scheduler-ready', () => {
  console.log('scheduler is ready!');
});

ipcMain.on('autosolver-finished', () => {
  // oh we are done!
  console.log('autosolver just finished! Imma click');
});

ipcMain.on('log', (event, message) => console.log(message));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
