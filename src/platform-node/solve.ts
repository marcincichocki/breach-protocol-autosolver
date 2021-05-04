import { t } from '@/common';
import {
  BreachProtocol,
  breachProtocolOCR,
  BreachProtocolRecognitionResult,
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

  log.text = t`OCR_START`;
  const ocr = await recognizeImage(fileName);

  if (!ocr.valid) {
    log.text = t`DEBUG`;
    handleInvalidBreachProtocol(fileName, ocr);

    const ids = ocr.getInvalidFragmentIds();
    log.fail(t`OCR_DATA_INVALID ${ids.join(', ')}`);

    // exit early because data is invalid.
    return;
  }

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
}

async function recognizeImage(fileName: string) {
  const image = sharp(fileName);
  const container = await SharpImageContainer.create(image);

  return breachProtocolOCR(
    container,
    {
      bufferSize: options.thresholdBufferSize,
      daemons: options.thresholdDaemons,
      grid: options.thresholdGrid,
    },
    options.experimentalBufferSizeRecognition
  );
}

function handleInvalidBreachProtocol(
  fileName: string,
  result: BreachProtocolRecognitionResult
) {
  if (!options.disableSound) {
    play(options.soundPath);
  }

  const debugData = new BreachProtocolDebug(fileName, result);
  appendToDebugJson(debugData);
}
