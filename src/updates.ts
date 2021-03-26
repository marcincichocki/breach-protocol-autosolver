import { Octokit } from '@octokit/rest';
import { prompt } from 'inquirer';
import open from 'open';
import { options } from './util';

const { version } = require('../package.json');
const client = new Octokit();
const owner = 'marcincichocki';
const repo = 'breach-protocol-autosolver';

export async function checkForUpdates() {
  if (options.skipUpdateCheck) {
    return;
  }

  console.info(
    'Checking for updates...\n Use flag --skip-update-check to disable it.'
  );

  const { data } = await client.repos.getLatestRelease({ owner, repo });

  if (!data.tag_name.endsWith(version)) {
    const { download } = await prompt({
      type: 'confirm',
      message: `There is new version(${data.tag_name}) available. Download and exit?`,
      name: 'download',
      default: true,
    });

    if (download) {
      const { browser_download_url } = data.assets[0];

      await open(browser_download_url, { wait: true });

      process.exit(0);
    }
  } else {
    console.info('Up to date.');
  }
}
