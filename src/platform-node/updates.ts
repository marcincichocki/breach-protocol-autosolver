import { t } from '@/common';
import { Octokit } from '@octokit/rest';
import { prompt } from 'inquirer';
import open from 'open';
import ora from 'ora';
import { options } from './cli';

const { version } = require('../../package.json');
const client = new Octokit();
const owner = 'marcincichocki';
const repo = 'breach-protocol-autosolver';

export async function checkForUpdates() {
  if (options.skipUpdateCheck) {
    return;
  }

  const m1 = ora(t`CHECK_FOR_UPDATES`).start();
  const { data } = await client.repos.getLatestRelease({ owner, repo });

  if (!data.tag_name.endsWith(version)) {
    m1.succeed();

    const { download } = await prompt({
      type: 'confirm',
      message: t`NEW_VERSION_AVAILABLE ${data.tag_name}`,
      name: 'download',
      default: true,
    });

    if (download) {
      const { browser_download_url } = data.assets[0];

      await open(browser_download_url, { wait: true });

      process.exit(0);
    }
  } else {
    m1.succeed(t`UP_TO_DATE`);
  }
}
