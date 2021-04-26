import HtmlWebpackPlugin from 'html-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { join } from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

export const config: webpack.Configuration = {
  mode: 'development',
  entry: join(__dirname, '../src/client-electron/worker/index.ts'),
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
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  // @ts-ignore
  externals: [nodeExternals()],
  plugins: [
    new HtmlWebpackPlugin({
      template: join(__dirname, '../public/worker.html'),
      filename: 'worker.html',
    }),
  ],
};
