import { globalErrorHandler } from './error-handler';
import { BreachProtocolWorker } from './worker';

const worker = new BreachProtocolWorker();

worker.bootstrap();

window.addEventListener('error', globalErrorHandler);
window.addEventListener('unhandledrejection', globalErrorHandler);
window.addEventListener('unload', () => worker.dispose());
