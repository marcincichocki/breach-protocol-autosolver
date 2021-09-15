import WebpackLicensePlugin from 'webpack-license-plugin';
import { defineConstantsPlugin, getConfig } from './common';

export const config = getConfig({
  target: 'electron-main',
  entry: {
    main: './main/index.ts',
  },
  plugins: [
    defineConstantsPlugin,
    new WebpackLicensePlugin({
      outputFilename: 'main-licenses.json',
    }),
  ],
});
