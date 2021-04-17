import { setLang } from '@/common';
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
  });

  window.loadFile('./renderer/index.html');
  window.webContents.openDevTools();

  return window;
}

function createWorkerWindow() {
  const window = new BrowserWindow({
    show: false,
  });

  window.loadFile('./worker/index.html');

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

ipcMain.on('autosolver-finished', () => {
  // oh we are done!
  console.log('autosolver just finished! Imma click');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
