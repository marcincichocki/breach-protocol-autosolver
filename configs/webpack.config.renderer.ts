import HtmlWebpackPlugin from 'html-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { join } from 'path';
import webpack from 'webpack';

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
    new HtmlWebpackPlugin({
      template: join(__dirname, '../public/renderer.html'),
      filename: 'renderer.html',
    }),
  ],
};
