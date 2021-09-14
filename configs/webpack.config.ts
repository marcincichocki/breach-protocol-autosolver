import { config as mainConfig } from './webpack.config.main';
import { config as preloadConfig } from './webpack.config.preload';
import { config as rendererConfig } from './webpack.config.renderer';
import { config as workerConfig } from './webpack.config.worker';

export default [mainConfig, rendererConfig, workerConfig, preloadConfig];
