import HtmlWebpackPlugin from 'html-webpack-plugin';
import { join } from 'path';
import webpack from 'webpack';

export const config: webpack.Configuration = {
  mode: 'development',
  entry: join(__dirname, '../src/client-electron/renderer/renderer.tsx'),
  target: 'electron-renderer',
  output: {
    path: join(__dirname, '../dist'),
    filename: 'renderer.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.ttf$/,
        loader: 'file-loader',
      },
      {
        test: /\.svg$/,
        loader: 'file-loader',
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
