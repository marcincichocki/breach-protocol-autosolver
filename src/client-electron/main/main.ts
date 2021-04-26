import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

function createRendererWindow() {
  const window = new BrowserWindow({
    minWidth: 1280,
    minHeight: 720,
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
}

main();

ipcMain.on('worker:ready', () => {
  console.log('worker is ready');
});
