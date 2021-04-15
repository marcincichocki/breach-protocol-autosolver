import path from 'path';
import sharp from 'sharp';
import registry from '../bp-registry/registry.json';
import { BufferSize } from './common';
import { Resolution } from './ocr';
import { BreachProtocolOCRFragment } from './ocr/base';
import { SharpImageContainer } from './ocr/image-container';
import { breachProtocolOCR2 } from './ocr/ocr';

interface RegistryEntry {
  fileName: string;
  daemons: string[][];
  grid: string[];
  bufferSize: BufferSize;
}

type Registry = Record<Resolution, RegistryEntry[]>;

describe('ocr', () => {
  beforeAll(async () => {
    await BreachProtocolOCRFragment.initScheduler();
  }, 30000);

  afterAll(async () => {
    await BreachProtocolOCRFragment.terminateScheduler();
  });

  it.each(getRegistryFor('1920x1080'))(
    'should correctly ocr 1920x1080/%s',
    async (f: string, entry: RegistryEntry) => {
      await compareOcrToJson(entry, '1920x1080');
    }
  );

  it.each(getRegistryFor('2560x1440'))(
    'should correctly ocr 2560x1440/%s',
    async (f: string, entry: RegistryEntry) => {
      await compareOcrToJson(entry, '2560x1440');
    }
  );

  it.each(getRegistryFor('3840x2160'))(
    'should correctly ocr 3840x2160/%s',
    async (f: string, entry: RegistryEntry) => {
      await compareOcrToJson(entry, '3840x2160');
    }
  );
});

function getRegistryFor(resolution: Resolution) {
  return (registry as Registry)[resolution].map((e) => [e.fileName, e]);
}

async function compareOcrToJson(entry: RegistryEntry, resolution: Resolution) {
  const file = path.join('./src/bp-registry', resolution, entry.fileName);
  const image = sharp(file);
  const container = await SharpImageContainer.create(image);
  const { rawData } = await breachProtocolOCR2(container);

  expect(rawData.grid).toEqual(entry.grid);
  expect(rawData.daemons).toEqual(entry.daemons);
  expect(rawData.bufferSize).toBe(entry.bufferSize);
}
