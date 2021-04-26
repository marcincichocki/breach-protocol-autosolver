import { join } from 'path';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export const config: webpack.Configuration = {
  mode: 'development',
  entry: join(__dirname, '../src/client-electron/main/main.ts'),
  target: 'electron-main',
  output: {
    path: join(__dirname, '../dist'),
    filename: 'main.js',
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
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'package.json',
          to: 'package.json',
          transform(content) {
            const json = JSON.parse(content.toString());

            delete json.devDependencies;
            delete json.build;

            return JSON.stringify(json);
          },
        },
      ],
    }),
  ],
};
