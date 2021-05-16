import { BreachProtocolWorker } from './worker';

const worker = new BreachProtocolWorker();

// TODO: error handling in worker.
worker.bootstrap();

window.addEventListener('unload', () => {
  worker.dispose();
});
