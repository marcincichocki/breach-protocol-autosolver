import { execSync } from 'child_process';
import {
  DefinePlugin,
  EnvironmentPlugin,
  RuleSetRule,
  WebpackPluginInstance,
} from 'webpack';

function git(command: string) {
  return execSync(`git ${command}`, { encoding: 'utf-8' }).trim();
}

const pkg = require('../package.json');

export const commonPlugins: WebpackPluginInstance[] = [
  new EnvironmentPlugin({
    GIT_COMMIT_DATE: git('show -s --format=%ct'),
    GIT_COMMIT_SHA: git('rev-parse HEAD'),
  }),
  new DefinePlugin({
    'process.env.npm_package_version': JSON.stringify(pkg.version),
    'process.env.npm_package_homepage': JSON.stringify(pkg.homepage),
    'process.env.npm_package_bugs_url': JSON.stringify(pkg.bugs),
    'process.env.npm_package_build_productName': JSON.stringify(
      pkg.build.productName
    ),
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
