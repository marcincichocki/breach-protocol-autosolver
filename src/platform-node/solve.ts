import { t } from '@/common';
import {
  BreachProtocol,
  breachProtocolOCR,
  BreachProtocolValidationError,
  FragmentId,
  produceSequences,
  transformRawData,
} from '@/core';
import { remove } from 'fs-extra';
import ora from 'ora';
import { play } from 'sound-play';
import { options } from './cli';
import { appendToDebugJson, BreachProtocolDebug } from './debug';
import { captureScreen, resolveBreachProtocol } from './robot';

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
    if (e instanceof BreachProtocolValidationError) {
      if (!options.disableSound) {
        play(options.soundPath);
      }

      log.text = t`DEBUG`;
      const debugData = new BreachProtocolDebug(fileName, e.data);
      appendToDebugJson(debugData);

      log.fail(e.message);

      // exit early because data is invalid.
      return;
    }

    throw e;
  }

  await remove(fileName);
  log.text = t`SOLVER_START`;

  const data = transformRawData(ocr.rawData);
  const sequences = produceSequences(data.tDaemons, data.bufferSize);
  const game = new BreachProtocol(data.tGrid, data.bufferSize);
  const result = game.solve(sequences);

  await resolveBreachProtocol(result.path, ocr.squarePositionMap);

  log.succeed(t`SOLVER_DONE`);
}
