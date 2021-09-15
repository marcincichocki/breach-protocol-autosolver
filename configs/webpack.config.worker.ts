import HtmlWebpackPlugin from 'html-webpack-plugin';
import { join } from 'path';
import WebpackLicensePlugin from 'webpack-license-plugin';
import { defineConstantsPlugin, getConfig, root } from './common';

const externalPackages = ['sharp', 'tesseract.js', 'screenshot-desktop'];
const externalEnteries = externalPackages.map((n) => [n, `commonjs ${n}`]);
const externals = Object.fromEntries(externalEnteries);

function getAbsolutePathToExternalPackage(name: string) {
  return join(root, 'node_modules', name);
}

export const config = getConfig({
  target: 'electron-renderer',
  entry: {
    worker: './worker/index.ts',
  },
  externals,
  plugins: [
    defineConstantsPlugin,
    new WebpackLicensePlugin({
      outputFilename: 'worker-licenses.json',
      includePackages() {
        return externalPackages.map(getAbsolutePathToExternalPackage);
      },
    }),
    new HtmlWebpackPlugin({
      filename: '[name].html',
    }),
  ],
});
