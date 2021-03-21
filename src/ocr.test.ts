import {
  BreachProtocolFragmentConfig,
  loadWorkers,
  breachProtocolOCR,
  FragmentId,
  Resolution,
} from './ocr';
import configs from './configs.json';
import registry from '../data/registry.json';
import { BufferSize } from './common';
import path from 'path';

interface RegistryEntry {
  fileName: string;
  daemons: string[][];
  grid: string[];
  bufferSize: BufferSize;
}

/**
 * 1080p:
 *  - grid: 120
 *  - buffer: 200
 *  - daemons: 45
 * 1440p:
 *  - grid: 120
 *  - buffer: 178(200?)
 *  - daemons: 45
 * 4k:
 *  - grid: 120(?)
 *  - buffer: 225
 *  - daemons: 10
 */

type Registry = Record<Resolution, RegistryEntry[]>;

describe('ocr', () => {
  let workers: Record<FragmentId, Tesseract.Worker>;

  beforeAll(async () => {
    workers = await loadWorkers(configs as BreachProtocolFragmentConfig[]);
  });

  afterAll(async () => {
    for (const fragmentId in workers) {
      const worker = workers[fragmentId as FragmentId];

      await worker.terminate();
    }
  });

  fit('should correctly ocr 1920x1080 images', async () => {
    await compareOcrToJson('1920x1080', workers);
  });

  it('should correctly ocr 2560x1440 images', async () => {
    await compareOcrToJson('2560x1440', workers);
  });

  it('should correctly ocr 3840x2160 images', async () => {
    await compareOcrToJson('3840x2160', workers);
  });
});

async function compareOcrToJson(
  resolution: Resolution,
  workers: Record<FragmentId, Tesseract.Worker>
) {
  for (const entry of (registry as Registry)[resolution]) {
    if (entry.fileName !== '2.png') {
      continue;
    }
    console.log(resolution, entry.fileName);
    const file = path.join('./data', resolution, entry.fileName);
    const { rawData } = await breachProtocolOCR(file, workers);

    expect(rawData.grid).toEqual(entry.grid);
    expect(rawData.daemons).toEqual(entry.daemons);
    expect(rawData.bufferSize).toBe(entry.bufferSize);
  }
}
