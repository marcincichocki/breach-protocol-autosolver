import { execSync } from 'child_process';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { join } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import { commonPlugins } from './common';

function git(command: string) {
  return execSync(`git ${command}`).toString().trim();
}

export const config: webpack.Configuration = {
  mode: 'development',
  entry: join(__dirname, '../src/client-electron/renderer/index.tsx'),
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
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.ttf$/,
        loader: 'file-loader',
      },
      {
        test: /\.svg$/,
        loader: 'file-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    ...commonPlugins,
    new HtmlWebpackPlugin({
      template: join(__dirname, '../public/renderer.html'),
      filename: 'renderer.html',
    }),
  ],
};
