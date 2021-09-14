import HtmlWebpackPlugin from 'html-webpack-plugin';
import { join } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import { commonPlugins, commonRules, getCSPMetaTagConfig } from './common';

const pkg = require('../package.json');
const allowedSources =
  "default-src 'none'; img-src data:; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; font-src 'self';";
const csp = getCSPMetaTagConfig(allowedSources);

export const config: webpack.Configuration = {
  mode: 'development',
  entry: join(__dirname, '../src/electron/renderer/index.tsx'),
  target: 'electron-renderer',
  output: {
    path: join(__dirname, '../dist'),
    filename: 'renderer.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [...commonRules],
  },
  plugins: [
    ...commonPlugins,
    new HtmlWebpackPlugin({
      filename: 'renderer.html',
      title: pkg.build.productName,
      meta: { csp },
    }),
  ],
};
