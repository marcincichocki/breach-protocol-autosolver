import { BreachProtocolOCRFragment } from '@/core';
import { ipcRenderer } from 'electron';

async function bootstrap() {
  await BreachProtocolOCRFragment.initScheduler();

  ipcRenderer.send('worker:ready');
}

bootstrap();
