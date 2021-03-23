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

console.clear();
const log = createLogger(false);

(async () => {
  log('Loading workers...');
  const workers = await loadWorkers(configs as BreachProtocolFragmentConfig[]);
  log('Done!');
  const displays = await screenshot.listDisplays();

  if (displays.length) {
    const choices = displays.map((d) => ({
      name: `${d.id} - ${d.name}(${d.width}x${d.height})`,
      value: d.id,
    }));

    const answer = await prompt({
      name: 'id',
      message: 'Choose on which monitor Cyberpunk 2077 is running: ',
      type: 'list',
      choices,
    });

    console.log({ answer });
  }

  iohook.registerShortcut(options.keyBind, () => main(workers));
  iohook.start();
})();

async function main(workers: Record<FragmentId, Tesseract.Worker>) {
  const buffer = await captureScreen();
  const { rawData, squarePositionMap } = await breachProtocolOCR(
    buffer,
    workers
  );
  const data = transformRawData(rawData);
  const sequences = produceSequences(data.tDaemons, data.bufferSize);
  const game = new BreachProtocol(data.tGrid, data.bufferSize);
  const result = game.solve(sequences);

  log({ data, sequences, result });

  await resolveBreachProtocol(result.path, squarePositionMap);

  log('Done!');
}
