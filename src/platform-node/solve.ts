import { t } from '@/common';
import {
  BreachProtocol,
  breachProtocolOCR,
  BreachProtocolValidationError,
  FragmentId,
  makeSequences,
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
  const ocr = await tryToOCRBreachProtocol(fileName, workers, log);

  // exit early because data is invalid.
  if (!ocr) return;

  await remove(fileName);
  log.text = t`SOLVER_START`;

  const data = transformRawData(ocr.rawData);
  const sequences = makeSequences(data.daemons, data.bufferSize);
  const game = new BreachProtocol(data.tGrid, data.bufferSize);
  const result = game.solve(sequences);

  if (!result) {
    if (!options.disableSound) {
      play(options.soundPath);
    }

    log.fail(t`NO_SOLUTION`);

    return;
  }

  const willBreachProtocolExit = result.path.length === data.bufferSize;
  const notUsedDaemons = data.daemons.filter(
    (d, i) => !result.sequence.indexes.includes(i)
  );
  const notUsedDaemonsSize = notUsedDaemons
    .map((d) => d.length)
    .reduce((a, b) => a + b, 0);
  const shouldForceClose = notUsedDaemonsSize
    ? result.path.length + notUsedDaemonsSize <= data.bufferSize
    : false;

  await resolveBreachProtocol(
    result.path,
    ocr.squarePositionMap,
    willBreachProtocolExit,
    shouldForceClose
  );

  log.succeed(t`SOLVER_DONE`);
}

async function tryToOCRBreachProtocol(
  fileName: string,
  workers: Record<FragmentId, Tesseract.Worker>,
  log: ora.Ora
) {
  log.text = t`OCR_START`;

  try {
    return await breachProtocolOCR(fileName, workers, {
      bufferSize: options.thresholdBufferSize,
      daemons: options.thresholdDaemons,
      grid: options.thresholdGrid,
    });
  } catch (e) {
    if (e instanceof BreachProtocolValidationError) {
      if (!options.disableSound) {
        play(options.soundPath);
      }

      log.text = t`DEBUG`;
      const debugData = new BreachProtocolDebug(fileName, e.data);
      appendToDebugJson(debugData);

      log.fail(e.message);
      return;
    }

    throw e;
  }
}
