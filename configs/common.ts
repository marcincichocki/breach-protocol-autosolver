import { execSync } from 'child_process';
import { EnvironmentPlugin, RuleSetRule, WebpackPluginInstance } from 'webpack';

function git(command: string) {
  return execSync(`git ${command}`, { encoding: 'utf-8' }).trim();
}

export const commonPlugins: WebpackPluginInstance[] = [
  new EnvironmentPlugin([
    'npm_package_version',
    'npm_package_homepage',
    'npm_package_bugs_url',
    'npm_package_build_productName',
  ]),
  new EnvironmentPlugin({
    GIT_COMMIT_DATE: git('show -s --format=%ct'),
    GIT_COMMIT_SHA: git('rev-parse HEAD'),
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
