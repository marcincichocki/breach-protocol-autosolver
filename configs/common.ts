import { execSync } from 'child_process';
import { join, resolve } from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import {
  Configuration,
  DefinePlugin,
  RuleSetRule,
  WebpackPluginInstance,
} from 'webpack';
import LicensePlugin from 'webpack-license-plugin';

function git(command: string) {
  return execSync(`git ${command}`, { encoding: 'utf-8' }).trim();
}

const pkg = require('../package.json');

export const commonPlugins: WebpackPluginInstance[] = [
  new DefinePlugin({
    GIT_COMMIT_DATE: JSON.stringify(
      git('log -1 --format=%cd --date=iso-strict')
    ),
    GIT_COMMIT_SHA: JSON.stringify(git('rev-parse HEAD')),
    VERSION: JSON.stringify(pkg.version),
    HOMEPAGE_URL: JSON.stringify(pkg.homepage),
    BUGS_URL: JSON.stringify(pkg.bugs),
    PRODUCT_NAME: JSON.stringify(pkg.build.productName),
    APP_ID: JSON.stringify(pkg.build.appId),
    BUILD_PLATFORM: JSON.stringify(process.platform),
  }),
];

export const commonRules: RuleSetRule[] = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    loader: 'ts-loader',
  },
  {
    test: /\.(ttf|svg|png)$/,
    type: 'asset/resource',
  },
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  },
];

export function getCSPMetaTagConfig(content: string) {
  return {
    'http-equiv': 'Content-Security-Policy',
    content,
  };
}

export function getConfig(config: Configuration) {
  const root = resolve(__dirname, '..');

  return (env: any, options: any) => {
    const defaultConfig: Configuration = {
      mode: 'development',
      context: join(root, './src/electron'),
      output: {
        path: join(root, './dist'),
        filename: '[name].js',
      },
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        plugins: [new TsconfigPathsPlugin()],
      },
      module: {
        rules: [...commonRules],
      },
      plugins: [...commonPlugins, new LicensePlugin()],
    };

    return {
      ...defaultConfig,
      ...config,
    };
  };
}
