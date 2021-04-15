import { pressAnyKey, setLang, setScaling, t } from '@/common';
import { BreachProtocolOCRFragment } from '@/core';
import { prompt } from 'inquirer';
import ora from 'ora';
import screenshot from 'screenshot-desktop';
import { options, program } from './cli';
import { checkForUpdates } from './updates';

export async function bootstrap() {
  console.clear();

  try {
    program.parse();
  } catch (e) {
    await pressAnyKey();
    process.exit(1);
  }

  setLang(options.lang);

  await checkForUpdates();

  const l1 = ora(t`LOADING_WORKERS_START`).start();
  await BreachProtocolOCRFragment.initScheduler();
  l1.succeed();

  const displays = await screenshot.listDisplays();
  const screenId = await getScreenId(displays);
  const { dpiScale } = displays.find((d) => d.id === screenId);

  setScaling(dpiScale);

  return screenId;
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
