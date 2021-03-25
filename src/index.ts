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
import { createLogger, options } from './util';

import screenshot from 'screenshot-desktop';
import { prompt } from 'inquirer';
import { BreachProtocolDebug, appendToDebugJson } from './debug';
import { checkForUpdates } from './updates';

const log = createLogger(false);

(async () => {
  await checkForUpdates();

  log('Loading workers...');

  const workers = await loadWorkers(configs as BreachProtocolFragmentConfig[]);

  log('Done!');

  const displays = await screenshot.listDisplays();
  const screenId = await getScreenId(displays);

  // TODO: add advanced logging
  console.log(`Starting autosolver on screen: ${screenId}`);

  iohook.registerShortcut(options.keyBind, () => main(workers, screenId));
  iohook.start();
})();

async function getScreenId(displays: screenshot.ScreenshotDisplayOutput[]) {
  if (displays.length > 1) {
    const choices = displays.map((d) => ({
      name: `${d.name} (${d.width}x${d.height})`,
      value: d.id,
    }));

    return prompt({
      name: 'screenId',
      message: 'On which monitor Cyberpunk 2077 is running?',
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
  const fileName = (await captureScreen(screenId)) as string;
  const { rawData, squarePositionMap } = await breachProtocolOCR(
    fileName,
    workers
  );
  const data = transformRawData(rawData);
  const sequences = produceSequences(data.tDaemons, data.bufferSize);
  const game = new BreachProtocol(data.tGrid, data.bufferSize);
  const result = game.solve(sequences);

  log({ data, sequences, result });

  await resolveBreachProtocol(result.path, squarePositionMap);

  const debugData = new BreachProtocolDebug(
    fileName,
    rawData,
    result,
    sequences
  );

  appendToDebugJson(debugData);

  log('Done!');
}
