import HtmlWebpackPlugin from 'html-webpack-plugin';
import { join } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import { commonPlugins, commonRules } from './common';

export const config: webpack.Configuration = {
  mode: 'development',
  entry: join(__dirname, '../src/electron/renderer/src/index.tsx'),
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
      template: join(__dirname, '../src/electron/renderer/src/index.html'),
      filename: 'renderer.html',
      title: process.env.npm_package_build_productName,
    }),
  ],
};
