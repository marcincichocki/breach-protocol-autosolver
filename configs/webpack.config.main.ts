import { join } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import { commonPlugins, commonRules } from './common';

export const config: webpack.Configuration = {
  mode: 'development',
  entry: join(__dirname, '../src/electron/main/index.ts'),
  target: 'electron-main',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    path: join(__dirname, '../dist'),
    filename: 'main.js',
  },
  module: {
    rules: [...commonRules],
  },
  plugins: [...commonPlugins],
};
