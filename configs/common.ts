import { execSync } from 'child_process';
import { join, resolve } from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';

function git(command: string) {
  return execSync(`git ${command}`, { encoding: 'utf-8' }).trim();
}

const pkg = require('../package.json');

export const defineConstantsPlugin = new DefinePlugin({
  GIT_COMMIT_DATE: JSON.stringify(git('log -1 --format=%cd --date=iso-strict')),
  GIT_COMMIT_SHA: JSON.stringify(git('rev-parse HEAD')),
  VERSION: JSON.stringify(pkg.version),
  HOMEPAGE_URL: JSON.stringify(pkg.homepage),
  BUGS_URL: JSON.stringify(pkg.bugs),
  PRODUCT_NAME: JSON.stringify(pkg.build.productName),
  APP_ID: JSON.stringify(pkg.build.appId),
  BUILD_PLATFORM: JSON.stringify(process.platform),
});

export const root = resolve(__dirname, '..');

export function getCSPMetaTagConfig(content: string) {
  return {
    'http-equiv': 'Content-Security-Policy',
    content,
  };
}

type ConfigurationCallback = (
  isProduction: boolean,
  env: any,
  options: any
) => Configuration;

export function getConfig(
  configOrCallback: Configuration | ConfigurationCallback
) {
  return (env: any, options: any) => {
    const mode = options.mode === 'production' ? 'production' : 'development';
    const defaultConfig: Configuration = {
      mode,
      context: join(root, './src/electron'),
      output: {
        path: join(root, 'dist'),
        filename: '[name].js',
      },
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        plugins: [new TsconfigPathsPlugin()],
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: 'pre',
            use: ['source-map-loader'],
          },
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            loader: 'ts-loader',
            options: {
              transpileOnly: mode === 'development',
            },
          },
          {
            test: /\.(ttf|svg|png)$/,
            type: 'asset/resource',
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
        ],
      },
      optimization: {
        // NOTE: This allow WebpackLicensePlugin to work with ESNext module,
        // which is required for tree shaking.
        concatenateModules: false,
      },
    };
    const config =
      typeof configOrCallback === 'function'
        ? configOrCallback(mode === 'production', env, options)
        : configOrCallback;

    return {
      ...defaultConfig,
      ...config,
    };
  };
}
