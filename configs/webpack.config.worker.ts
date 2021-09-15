import HtmlWebpackPlugin from 'html-webpack-plugin';
import LicensePlugin from 'webpack-license-plugin';
import { commonPlugins, getConfig } from './common';

export default getConfig({
  target: 'electron-renderer',
  entry: {
    worker: './worker/index.ts',
  },
  externals: {
    sharp: 'commonjs sharp',
    'tesseract.js': 'commonjs tesseract.js',
    'screenshot-desktop': 'commonjs screenshot-desktop',
  },
  plugins: [
    ...commonPlugins,
    new HtmlWebpackPlugin({
      filename: '[name].html',
    }),
    new LicensePlugin(),
  ],
});
