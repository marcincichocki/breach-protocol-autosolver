import { SharpImageContainer, SharpImageContainerConfig } from '@/common/node';
import { WasmBreachProtocolRecognizer } from '@/common/node/recognizer-wasm';
import { join } from 'path';
import sharp from 'sharp';
import registry from '../bp-registry/registry.json';
import {
  BreachProtocolRawData,
  BufferSize,
  DaemonsRawData,
  GridRawData,
} from '../common';
import {
  BreachProtocolFragmentStatus,
  BreachProtocolRecognizer,
  FragmentId,
} from './base';
import { BreachProtocolBufferSizeFragment } from './buffer-size';
import { BreachProtocolBufferSizeTrimFragment } from './buffer-size-trim';
import { BreachProtocolDaemonsFragment } from './daemons';
import { BreachProtocolGridFragment } from './grid';
import { ImageContainer } from './image-container';
import { breachProtocolOCR } from './ocr';

interface RegistryEntry extends BreachProtocolRawData {
  /** Source path relative to registry.json */
  path: string;
}

interface RegistryConfig extends SharpImageContainerConfig {
  thresholds?: Partial<Record<FragmentId, number>>;
}

type Resolution =
  | 'custom'
  | '1024x768'
  | '1920x1080'
  | '2560x1440'
  | '3440x1440'
  | '3840x2160';

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
  let recognizer: TestBreachProtocolRecognizer;
  let container: NoopImageContainer;

  beforeAll(() => {
    recognizer = new TestBreachProtocolRecognizer();
    container = new NoopImageContainer({ x: 1920, y: 1080 });
    // @ts-ignore
    WasmBreachProtocolRecognizer.scheduler = true;
  });

  afterAll(() => {
    WasmBreachProtocolRecognizer['scheduler'] = undefined;
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
  const valid = BreachProtocolFragmentStatus.Valid;

  it('should pass it if data is valid', () => {
    const gridFragment = new BreachProtocolGridFragment(container, recognizer);
    const daemonsFragment = new BreachProtocolDaemonsFragment(
      container,
      recognizer
    );
    const bufferSizeFragment = new BreachProtocolBufferSizeFragment(container);

    expect(gridFragment.getStatus(grid)).toBe(valid);
    expect(daemonsFragment.getStatus(daemons)).toBe(valid);
    expect(bufferSizeFragment.getStatus(bufferSize)).toBe(valid);
  });

  it('should throw an error if grid is invalid', () => {
    const fragment = new BreachProtocolGridFragment(container, recognizer);
    const invalidGrids = [
      grid.map((s, i) => (i === 5 ? '57' : s)),
      grid.map((s, i) => (i === 9 ? 'asd' : s)),
      grid.map(() => ' '),
      grid.slice(1),
      [],
    ] as GridRawData[];

    invalidGrids.forEach((grid) => {
      expect(fragment.getStatus(grid)).not.toBe(valid);
    });
  });

  it('should throw an error if daemons are invalid', () => {
    const fragment = new BreachProtocolDaemonsFragment(container, recognizer);
    const invalidDaemons = [
      daemons.map(() => ['B7']),
      daemons.map(() => ['asd']),
      daemons.map(() => [' ']),
      daemons.map(() => [] as string[]),
    ] as DaemonsRawData[];

    invalidDaemons.forEach((daemons) => {
      expect(fragment.getStatus(daemons)).not.toBe(valid);
    });
  });

  it('should throw an error if buffer size is invalid', () => {
    const fragment = new BreachProtocolBufferSizeFragment(container);
    const invalidBufferSizes = [NaN, 3, 10, 2 * Math.PI] as BufferSize[];

    invalidBufferSizes.forEach((bufferSize) => {
      expect(fragment.getStatus(bufferSize)).not.toBe(valid);
    });
  });
});

describe('ocr', () => {
  beforeAll(async () => {
    await WasmBreachProtocolRecognizer.initScheduler('./resources');
  }, 30000);

  afterAll(async () => {
    await WasmBreachProtocolRecognizer.terminateScheduler();
  });

  it.each(getRegistryFor('custom'))(
    'should correctly ocr %s',
    async (p: string, entry: RegistryEntry) => {
      await expectRegistryEntryToEqualRawData(entry);
    }
  );

  it.each(getRegistryFor('1024x768'))(
    'should correctly ocr %s',
    async (p: string, entry: RegistryEntry) => {
      // This resolution requires fixed thresholds.
      const thresholds = { grid: 155, daemons: 140 };

      await expectRegistryEntryToEqualRawData(entry, { thresholds });
    }
  );

  it.each(getRegistryFor('1920x1080'))(
    'should correctly ocr %s',
    async (p: string, entry: RegistryEntry) => {
      await expectRegistryEntryToEqualRawData(entry);
    }
  );

  it.each(getRegistryFor('2560x1440'))(
    'should correctly ocr %s',
    async (p: string, entry: RegistryEntry) => {
      await expectRegistryEntryToEqualRawData(entry);
    }
  );

  it.each(getRegistryFor('3440x1440'))(
    'should correctly ocr 3440x1440/%s',
    async (p: string, entry: RegistryEntry) => {
      await expectRegistryEntryToEqualRawData(entry);
    }
  );

  it.each(getRegistryFor('3840x2160'))(
    'should correctly ocr %s',
    async (p: string, entry: RegistryEntry) => {
      await expectRegistryEntryToEqualRawData(entry);
    }
  );

  it.each(getRegistryFor('3840x2160'))(
    'should correctly ocr %s with downscaling',
    async (p: string, entry: RegistryEntry) => {
      const thresholds = { daemons: 45 };

      await expectRegistryEntryToEqualRawData(entry, {
        downscaleSource: true,
        thresholds,
      });
    }
  );
});

function getRegistryFor(resolution: Resolution) {
  return registry[resolution].map(
    (e) => [e.path, e] as [string, RegistryEntry]
  );
}

async function expectRegistryEntryToEqualRawData(
  entry: RegistryEntry,
  config: RegistryConfig = {}
) {
  const [ocr, trim] = await recognizeRegistryEntry(entry, config);

  expect(entry.grid).toEqual(ocr.rawData.grid);
  expect(entry.daemons).toEqual(ocr.rawData.daemons);
  expect(entry.bufferSize).toBe(ocr.rawData.bufferSize);
  expect(entry.bufferSize).toBe(trim.rawData);

  expect(ocr.isValid).toBe(true);
  expect(trim.isValid).toBe(true);
}

async function recognizeRegistryEntry(
  entry: RegistryEntry,
  { downscaleSource, thresholds }: RegistryConfig
) {
  const file = join('./src/core/bp-registry', entry.path);
  const image = sharp(file);
  const container = await SharpImageContainer.create(image, {
    downscaleSource,
  });
  const trimStrategy = new BreachProtocolBufferSizeTrimFragment(container);
  const recognizer = new WasmBreachProtocolRecognizer();

  return Promise.all([
    breachProtocolOCR(container, recognizer, thresholds),
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

class TestBreachProtocolRecognizer implements BreachProtocolRecognizer {
  // @ts-ignore
  async recognize(): any {}
}
