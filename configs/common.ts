import { execSync } from 'child_process';
import { EnvironmentPlugin } from 'webpack';

function git(command: string) {
  return execSync(`git ${command}`, { encoding: 'utf-8' }).trim();
}

export const commonPlugins = [
  new EnvironmentPlugin([
    'npm_package_version',
    'npm_package_homepage',
    'npm_package_bugs_url',
    'npm_package_build_productName',
  ]),
  new EnvironmentPlugin({
    GIT_COMMIT_DATE: git('show -s --format=%ct'),
    GIT_COMMIT_SHA: git('rev-parse HEAD'),
    GIT_TAG: git('describe --abbrev=0'),
  }),
];
