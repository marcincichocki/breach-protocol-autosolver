import HtmlWebpackPlugin from 'html-webpack-plugin';
import { join } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import { commonPlugins, commonRules } from './common';

export const config: webpack.Configuration = {
  mode: 'development',
  entry: join(__dirname, '../src/electron/worker/src/index.ts'),
  target: 'electron-renderer',
  output: {
    path: join(__dirname, '../dist'),
    filename: 'worker.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [...commonRules],
  },
  externals: {
    sharp: 'commonjs sharp',
    'tesseract.js': 'commonjs tesseract.js',
    'screenshot-desktop': 'commonjs screenshot-desktop',
  },
  plugins: [
    ...commonPlugins,
    new HtmlWebpackPlugin({
      template: join(__dirname, '../src/electron/worker/src/index.html'),
      filename: 'worker.html',
    }),
  ],
};
