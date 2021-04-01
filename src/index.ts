/**
 * NOTE: Only bootstrap for node is implemented at this moment.
 */
import { bootstrap, register } from '@/platform-node';

bootstrap().then(register);
