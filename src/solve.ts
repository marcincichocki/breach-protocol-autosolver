import { remove } from 'fs-extra';
import ora from 'ora';
import { play } from 'sound-play';
import { options } from './cli';
import { transformRawData } from './common';
import { appendToDebugJson, BreachProtocolDebug } from './debug';
import { BreachProtocol } from './game';
import { breachProtocolOCR, FragmentId } from './ocr';
import { captureScreen, resolveBreachProtocol } from './robot';
import { produceSequences } from './sequence';
import { t } from './translate';

export async function solveBreachProtocol(
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
