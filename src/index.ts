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
import { createLogger } from './util';

const log = createLogger(true);

log('Loading workers...');

loadWorkers(configs as BreachProtocolFragmentConfig[]).then((workers) => {
  log('Done!');

  // Default keybind: Ctrl+,
  iohook.registerShortcut([29, 83], () => main(workers));
  iohook.start();
});

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
