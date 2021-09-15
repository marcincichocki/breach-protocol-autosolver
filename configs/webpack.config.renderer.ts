import HtmlWebpackPlugin from 'html-webpack-plugin';
import WebpackLicensePlugin from 'webpack-license-plugin';
import {
  defineConstantsPlugin,
  getConfig,
  getCSPMetaTagConfig,
} from './common';

const pkg = require('../package.json');
const allowedSources =
  "default-src 'none'; img-src data:; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; font-src 'self';";
const csp = getCSPMetaTagConfig(allowedSources);

export const config = getConfig({
  target: 'electron-renderer',
  entry: {
    renderer: './renderer/index.tsx',
  },
  plugins: [
    defineConstantsPlugin,
    new WebpackLicensePlugin({
      outputFilename: 'renderer-licenses.json',
    }),
    new HtmlWebpackPlugin({
      filename: '[name].html',
      title: pkg.build.productName,
      meta: { csp },
    }),
  ],
});
