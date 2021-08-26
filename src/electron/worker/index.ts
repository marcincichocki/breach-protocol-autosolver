import './error-handler';
import { BreachProtocolWorker } from './worker';

const worker = new BreachProtocolWorker();

worker.bootstrap();

window.addEventListener('unload', () => worker.dispose());
