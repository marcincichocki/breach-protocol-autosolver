import { options } from './cli';
import iohook from 'iohook';
import { transformRawData } from './common';
import { BreachProtocol } from './game';
import { produceSequences } from './sequence';
import {
  breachProtocolOCR,
  loadWorkers,
  BreachProtocolFragmentConfig,
  FragmentId,
} from './ocr';
import { resolveBreachProtocol, captureScreen } from './robot';
import configs from './configs.json';

import screenshot from 'screenshot-desktop';
import { prompt } from 'inquirer';
import { BreachProtocolDebug, appendToDebugJson } from './debug';
import { checkForUpdates } from './updates';
import { remove } from 'fs-extra';
import { t } from './translate';
import ora from 'ora';
import { play } from 'sound-play';

(async () => {
  console.clear();

  await checkForUpdates();

  const l1 = ora(t`LOADING_WORKERS_START`).start();
  const workers = await loadWorkers(configs as BreachProtocolFragmentConfig[]);
  l1.succeed();

  const displays = await screenshot.listDisplays();
  const screenId = await getScreenId(displays);
  let isRunning = false;

  iohook.registerShortcut(options.keyBind, async () => {
    if (isRunning) return;
    isRunning = true;

    await main(workers, screenId);

    console.info(t`READY`);
    isRunning = false;
  });

  iohook.start();
  console.info(t`READY`);
})();

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

async function main(
  workers: Record<FragmentId, Tesseract.Worker>,
  screenId: string
) {
  const log = ora(t`CAPTURE_SCREEN ${screenId}`).start();
  const fileName = (await captureScreen(screenId)) as string;
  let ocr = null;

  try {
    log.text = t`OCR_START`;
    ocr = await breachProtocolOCR(fileName, workers);
  } catch (e) {
    if (!options.disableSound) {
      play(options.soundPath);
    }

    log.fail(e.message);
    await remove(fileName);

    // exit early because data is invalid.
    return;
  }

  log.text = t`SOLVER_START`;

  const data = transformRawData(ocr.rawData);
  const sequences = produceSequences(data.tDaemons, data.bufferSize);
  const game = new BreachProtocol(data.tGrid, data.bufferSize);
  const result = game.solve(sequences);

  log.text = t`DEBUG`;

  await resolveBreachProtocol(result.path, ocr.squarePositionMap);

  const debugData = new BreachProtocolDebug(
    fileName,
    ocr.rawData,
    result,
    sequences
  );

  appendToDebugJson(debugData);

  log.succeed(t`SOLVER_DONE`);
}
