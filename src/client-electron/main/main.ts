import { app, BrowserWindow } from 'electron';
import { join } from 'path';

function createRendererWindow() {
  const window = new BrowserWindow({
    minWidth: 1280,
    minHeight: 720,
  });

  window.loadURL(join(__dirname, './index.html'));

  return window;
}

async function main() {
  await app.whenReady();

  const window = createRendererWindow();
  window.on('closed', () => app.exit());
}

main();
