import { prompt } from 'inquirer';
import ora from 'ora';
import screenshot from 'screenshot-desktop';
import { program } from './cli';
import configs from './configs.json';
import { BreachProtocolFragmentConfig, loadWorkers } from './ocr';
import { t } from './translate';
import { checkForUpdates } from './updates';
import { pressAnyKey } from './util';

export async function bootstrap() {
  console.clear();

  try {
    program.parse();
  } catch (e) {
    await pressAnyKey();
    process.exit(1);
  }

  await checkForUpdates();

  const l1 = ora(t`LOADING_WORKERS_START`).start();
  const workers = await loadWorkers(configs as BreachProtocolFragmentConfig[]);
  l1.succeed();

  const displays = await screenshot.listDisplays();
  const screenId = await getScreenId(displays);

  return {
    screenId,
    workers,
  };
}

async function getScreenId(displays: screenshot.ScreenshotDisplayOutput[]) {
  if (displays.length > 1) {
    const choices = displays.map((d) => ({
      name: `${d.name} (${d.width}x${d.height})`,
      value: d.id,
    }));

    return prompt({
      name: 'screenId',
      message: t`CHOOSE_MONITOR`,
      type: 'list',
      choices,
    }).then((d) => d.screenId);
  }

  return displays[0].id;
}
