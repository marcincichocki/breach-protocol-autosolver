import { execSync } from 'child_process';
import { LicenseWebpackPlugin } from 'license-webpack-plugin';
import { DefinePlugin, RuleSetRule, WebpackPluginInstance } from 'webpack';

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
  }),
  new LicenseWebpackPlugin({
    outputFilename: '3RD_PARTY_LICENSES.txt',
  }) as any,
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
