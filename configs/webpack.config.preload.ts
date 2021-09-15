import { getConfig } from './common';

export default getConfig({
  target: 'electron-preload',
  entry: {
    preload: './renderer/preload/index.ts',
  },
});
