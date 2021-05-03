import { t } from '@/common';
import {
  BreachProtocol,
  breachProtocolOCR,
  BreachProtocolValidationError,
  makeSequences,
  resolveExitStrategy,
  SharpImageContainer,
  transformRawData,
} from '@/core';
import { remove } from 'fs-extra';
import ora from 'ora';
import sharp from 'sharp';
import { play } from 'sound-play';
import { options } from './cli';
import { appendToDebugJson, BreachProtocolDebug } from './debug';
import { captureScreen, resolveBreachProtocol } from './robot';

export async function solveBreachProtocol(screenId: string) {
  const log = ora(t`CAPTURE_SCREEN ${screenId}`).start();
  const fileName = (await captureScreen(screenId)) as string;
  const ocr = await tryToOCRBreachProtocol(fileName, log);

  // exit early because data is invalid.
  if (!ocr.valid) return;

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

  const exitStrategy = resolveExitStrategy(result, ocr.rawData);

  await resolveBreachProtocol(result.path, ocr.positionSquareMap, exitStrategy);

  log.succeed(t`SOLVER_DONE`);

  ocr.saveFragments();
}

async function tryToOCRBreachProtocol(fileName: string, log: ora.Ora) {
  const image = sharp(fileName);
  const container = await SharpImageContainer.create(image);
  log.text = t`OCR_START`;

  try {
    return await breachProtocolOCR(
      container,
      {
        bufferSize: options.thresholdBufferSize,
        daemons: options.thresholdDaemons,
        grid: options.thresholdGrid,
      },
      options.experimentalBufferSizeRecognition
    );
  } catch (e) {
    // TODO: this will never run with latest changes.
    if (e instanceof BreachProtocolValidationError) {
      if (!options.disableSound) {
        play(options.soundPath);
      }

      log.text = t`DEBUG`;
      const debugData = new BreachProtocolDebug(fileName, e.result);
      appendToDebugJson(debugData);

      log.fail(e.message);
      return;
    }

    throw e;
  }
}
