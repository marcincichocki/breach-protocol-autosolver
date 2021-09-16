import WebpackLicensePlugin from 'webpack-license-plugin';
import { defineConstantsPlugin, getConfig } from './common';

export const config = getConfig({
  target: 'electron-preload',
  entry: {
    preload: './renderer/preload/index.ts',
  },
  plugins: [
    defineConstantsPlugin,
    new WebpackLicensePlugin({
      outputFilename: 'preload-licenses.json',
    }),
  ],
});
