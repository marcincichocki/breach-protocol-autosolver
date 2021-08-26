import { NativeDialog } from '../common';
import { BreachProtocolWorker } from './worker';

const worker = new BreachProtocolWorker();

worker.bootstrap();

window.addEventListener('error', (event) => {
  NativeDialog.alert({
    title: 'Error',
    type: 'error',
    message: 'Error occurred in worker process.',
    detail: event.message,
  });
});

window.addEventListener('unload', () => {
  worker.dispose();
});
