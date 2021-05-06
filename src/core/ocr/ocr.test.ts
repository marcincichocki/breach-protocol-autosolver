import path from 'path';
import sharp from 'sharp';
import registry from '../../bp-registry/registry.json';
import { BufferSize, DaemonsRawData, GridRawData } from '../common';
import { BreachProtocolOCRFragment, FragmentId } from './base';
import { BreachProtocolBufferSizeFragment } from './buffer-size';
import { BreachProtocolBufferSizeTrimFragment } from './buffer-size-trim';
import { BreachProtocolDaemonsFragment } from './daemons';
import { BreachProtocolGridFragment } from './grid';
import { ImageContainer, SharpImageContainer } from './image-container';
import { breachProtocolOCR } from './ocr';

interface RegistryEntry {
  fileName: string;
  daemons: string[][];
  grid: string[];
  bufferSize: BufferSize;
}

type Resolution = '1920x1080' | '2560x1440' | '3440x1440' | '3840x2160';
type Registry = Record<Resolution, RegistryEntry[]>;

describe('image container', () => {
  const aspectRatio = ImageContainer.ASPECT_RATIO;
  const horizontal = [
    [1024, 768],
    [1024, 1280],
    [1152, 864],
    [1280, 768],
    [1280, 800],
    [1280, 960],
    [1280, 1024],
    [1600, 1024],
    [1600, 1200],
    [1680, 1050],
    [1920, 1200],
    [1920, 1440],
  ];

  const vertical = [
    [2560, 1080],
    [3440, 1440],
    [3840, 1080],
  ];

  const regular = [
    [1280, 720],
    [1360, 768],
    [1366, 768],
    [1600, 900],
    [1920, 1080],
    [2560, 1440],
    [3840, 2160],
  ];

  it.each(horizontal)('should crop horizontal black bars(%ix%i)', (x, y) => {
    const container = new NoopImageContainer({ x, y });
    const { width, height, left, top } = container.getCroppedBoundingBox();

    expect(container.getAspectRatio(width, height)).toBe(aspectRatio);
    expect(width).toBe(x);
    expect(height).toBe(y - 2 * top);
    expect(left).toBe(0);
    expect(top).toBe((y - height) / 2);
  });

  it.each(vertical)('should crop vertical black bars(%ix%i)', (x, y) => {
    const container = new NoopImageContainer({ x, y });
    const { width, height, left, top } = container.getCroppedBoundingBox();

    expect(container.getAspectRatio(width, height)).toBe(aspectRatio);
    expect(width).toBe(x - 2 * left);
    expect(height).toBe(y);
    expect(left).toBe((x - width) / 2);
    expect(top).toBe(0);
  });

  it.each(regular)('should not crop 16:9 resolutions(%ix%i)', (x, y) => {
    const container = new NoopImageContainer({ x, y });
    const { width, height, left, top } = container.getCroppedBoundingBox();

    expect(container.getAspectRatio(width, height)).toBe(aspectRatio);
    expect(width).toBe(x);
    expect(height).toBe(y);
    expect(left).toBe(0);
    expect(top).toBe(0);
  });
});

describe('raw data validation', () => {
  let testContainer: NoopImageContainer;

  beforeAll(() => {
    testContainer = new NoopImageContainer({ x: 1920, y: 1080 });
    // @ts-ignore
    BreachProtocolOCRFragment.scheduler = true;
  });

  afterAll(() => {
    BreachProtocolOCRFragment.scheduler = undefined;
  });

  // prettier-ignore
  const grid: GridRawData = [
    'BD', 'E9', '1C', '7A',
    'FF', '55', '55', '1C',
    '7A', '7A', 'BD', 'BD',
    '1C', '55', 'E9', 'E9'
  ];
  const daemons: DaemonsRawData = [
    ['BD', 'E9'],
    ['1C', '7A'],
    ['FF', '55'],
  ];
  const bufferSize: BufferSize = 6;

  it('should pass it if data is valid', () => {
    const gridFragment = new BreachProtocolGridFragment(testContainer);
    const daemonsFragment = new BreachProtocolDaemonsFragment(testContainer);
    const bufferSizeFragment = new BreachProtocolBufferSizeFragment(
      testContainer
    );

    expect(gridFragment.isValid(grid)).toBeTruthy();
    expect(daemonsFragment.isValid(daemons)).toBeTruthy();
    expect(bufferSizeFragment.isValid(bufferSize)).toBeTruthy();
  });

  it('should throw an error if grid is invalid', () => {
    const fragment = new BreachProtocolGridFragment(testContainer);
    const invalidGrids = [
      grid.map((s, i) => (i === 5 ? '57' : s)),
      grid.map((s, i) => (i === 9 ? 'asd' : s)),
      grid.map(() => ' '),
      grid.slice(1),
      [],
    ] as GridRawData[];

    invalidGrids.forEach((grid) => {
      expect(fragment.isValid(grid)).toBeFalsy();
    });
  });

  it('should throw an error if daemons are invalid', () => {
    const fragment = new BreachProtocolDaemonsFragment(testContainer);
    const invalidDaemons = [
      daemons.map(() => ['B7']),
      daemons.map(() => ['asd']),
      daemons.map(() => [' ']),
      daemons.map(() => [] as string[]),
    ] as DaemonsRawData[];

    invalidDaemons.forEach((daemons) => {
      expect(fragment.isValid(daemons)).toBeFalsy();
    });
  });

  it('should throw an error if buffer size is invalid', () => {
    const fragment = new BreachProtocolBufferSizeFragment(testContainer);
    const invalidBufferSizes = [NaN, 3, 10, 2 * Math.PI] as BufferSize[];

    invalidBufferSizes.forEach((bufferSize) => {
      expect(fragment.isValid(bufferSize)).toBeFalsy();
    });
  });
});

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

  it.each(getRegistryFor('3440x1440'))(
    'should correctly ocr 3440x1440/%s',
    async (f: string, entry: RegistryEntry) => {
      await compareOcrToJson(entry, '3440x1440');
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
  const [ocr, trim] = await recognizeRegistryEntry(entry, resolution);

  expect(ocr.rawData.grid).toEqual(entry.grid);
  expect(ocr.rawData.daemons).toEqual(entry.daemons);
  expect(ocr.rawData.bufferSize).toBe(entry.bufferSize);
  expect(trim.rawData).toBe(entry.bufferSize);
}

async function recognizeRegistryEntry(
  entry: RegistryEntry,
  resolution: Resolution,
  thresholds?: Partial<Record<FragmentId, number>>
) {
  const file = path.join('./src/bp-registry', resolution, entry.fileName);
  const image = sharp(file);
  const container = await SharpImageContainer.create(image);
  const trimStrategy = new BreachProtocolBufferSizeTrimFragment(container);

  return Promise.all([
    breachProtocolOCR(container, thresholds),
    // To not repeat tesseract ocr, trim strategy is running separately.
    trimStrategy.recognize(),
  ]);
}

// @ts-ignore
// Only test protected methods
class NoopImageContainer extends ImageContainer<any> {
  constructor(public readonly dimensions: { x: number; y: number }) {
    super();
  }

  // These methods will be called in fragment's contructor
  process() {}
  processGridFragment() {}
  processDaemonsFragment() {}
  processBufferSizeFragment() {}
}
