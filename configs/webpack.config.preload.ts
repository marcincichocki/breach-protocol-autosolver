import { join } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import { commonPlugins, commonRules } from './common';

export const config: webpack.Configuration = {
  mode: 'development',
  entry: join(__dirname, '../src/electron/renderer/preload.ts'),
  target: 'electron-preload',
  output: {
    path: join(__dirname, '../dist'),
    filename: 'preload.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [...commonRules],
  },
  plugins: [...commonPlugins],
};
