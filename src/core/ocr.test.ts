import path from 'path';
import registry from '../bp-registry/registry.json';
import { BufferSize } from './common';
import configs from './configs.json';
import {
  BreachProtocolFragmentConfig,
  breachProtocolOCR,
  FragmentId,
  loadWorkers,
  Resolution,
} from './ocr';

interface RegistryEntry {
  fileName: string;
  daemons: string[][];
  grid: string[];
  bufferSize: BufferSize;
}

type Registry = Record<Resolution, RegistryEntry[]>;

describe('ocr', () => {
  let workers: Record<FragmentId, Tesseract.Worker>;

  beforeAll(async () => {
    workers = await loadWorkers(configs as BreachProtocolFragmentConfig[]);
  }, 30000);

  afterAll(async () => {
    for (const fragmentId in workers) {
      const worker = workers[fragmentId as FragmentId];

      await worker.terminate();
    }
  });

  it('should correctly ocr 1920x1080 images', async () => {
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
    const file = path.join('./src/bp-registry', resolution, entry.fileName);
    const { rawData } = await breachProtocolOCR(file, workers);

    expect(rawData.grid).toEqual(entry.grid);
    expect(rawData.daemons).toEqual(entry.daemons);
    expect(rawData.bufferSize).toBe(entry.bufferSize);
  }
}
