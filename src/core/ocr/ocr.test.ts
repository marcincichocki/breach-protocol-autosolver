import {
  SharpImageContainer,
  WasmBreachProtocolRecognizer,
} from '@/common/node';
import type { BreachProtocolLanguage } from '@/core';
import { AppSettings } from '@/electron/common';
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
  BreachProtocolBufferSizeFragment,
  BreachProtocolBufferSizeTrimFragment,
  BreachProtocolDaemonsFragment,
  BreachProtocolGridFragment,
  FragmentStatus,
} from './fragments';
import {
  Dimensions,
  FragmentContainer,
  ImageContainer,
} from './image-container';
import { breachProtocolOCR } from './ocr';
import { BreachProtocolRecognizer } from './recognizer';

interface RegistryEntry extends BreachProtocolRawData {
  /** Source path relative to registry.json */
  path: string;
  settings?: Partial<AppSettings>;
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
    const container = new NoopImageContainer({ width: x, height: y });
    const { width, height, left, top } = container.getCroppedBoundingBox();

    expect(container.getAspectRatio(width, height)).toBe(aspectRatio);
    expect(width).toBe(x);
    expect(height).toBe(y - 2 * top);
    expect(left).toBe(0);
    expect(top).toBe((y - height) / 2);
  });

  it.each(vertical)('should crop vertical black bars(%ix%i)', (x, y) => {
    const container = new NoopImageContainer({ width: x, height: y });
    const { width, height, left, top } = container.getCroppedBoundingBox();

    expect(container.getAspectRatio(width, height)).toBe(aspectRatio);
    expect(width).toBe(x - 2 * left);
    expect(height).toBe(y);
    expect(left).toBe((x - width) / 2);
    expect(top).toBe(0);
  });

  it.each(regular)('should not crop 16:9 resolutions(%ix%i)', (x, y) => {
    const container = new NoopImageContainer({ width: x, height: y });
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
    container = new NoopImageContainer({ width: 1920, height: 1080 });
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
  const valid = FragmentStatus.Valid;

  it('should pass it if data is valid', () => {
    const gridFragment = new BreachProtocolGridFragment(container, {
      recognizer,
      patch: '1.x',
    });
    const daemonsFragment = new BreachProtocolDaemonsFragment(container, {
      recognizer,
      extendedDaemonsAndTypesRecognitionRange: false,
      patch: '1.x',
    });
    const bufferSizeFragment = new BreachProtocolBufferSizeFragment(container, {
      extendedBufferSizeRecognitionRange: false,
      patch: '1.x',
    });

    expect(gridFragment.getStatus(grid)).toBe(valid);
    expect(daemonsFragment.getStatus(daemons)).toBe(valid);
    expect(bufferSizeFragment.getStatus(bufferSize)).toBe(valid);
  });

  it('should throw an error if grid is invalid', () => {
    const fragment = new BreachProtocolGridFragment(container, {
      recognizer,
      patch: '1.x',
    });
    const invalidGrids = [
      grid.map((s, i) => (i === 5 ? '57' : s)),
      grid.map((s, i) => (i === 9 ? 'test' : s)),
      grid.map(() => ' '),
      grid.slice(1),
      [],
    ] as GridRawData[];

    invalidGrids.forEach((grid) => {
      expect(fragment.getStatus(grid)).not.toBe(valid);
    });
  });

  it('should throw an error if daemons are invalid', () => {
    const fragment = new BreachProtocolDaemonsFragment(container, {
      recognizer,
      extendedDaemonsAndTypesRecognitionRange: false,
      patch: '1.x',
    });
    const invalidDaemons = [
      daemons.map(() => ['B7']),
      daemons.map(() => ['test']),
      daemons.map(() => [' ']),
      daemons.map(() => [] as string[]),
    ] as DaemonsRawData[];

    invalidDaemons.forEach((daemons) => {
      expect(fragment.getStatus(daemons)).not.toBe(valid);
    });
  });

  it('should throw an error if buffer size is invalid', () => {
    const fragment = new BreachProtocolBufferSizeFragment(container, {
      extendedBufferSizeRecognitionRange: false,
      patch: '1.x',
    });
    const invalidBufferSizes = [NaN, 3, 10, 2 * Math.PI] as BufferSize[];

    invalidBufferSizes.forEach((bufferSize) => {
      expect(fragment.getStatus(bufferSize)).not.toBe(valid);
    });
  });
});

describe('ocr', () => {
  const entries = Object.keys(registry).flatMap(
    (resolution: Resolution) => registry[resolution]
  );

  beforeAll(async () => {
    await WasmBreachProtocolRecognizer.init('./resources/tessdata', 'eng');
  }, 30000);

  afterAll(async () => {
    await WasmBreachProtocolRecognizer.terminate();
  });

  it.each(entries)(
    'should correctly ocr $path',
    async (entry: RegistryEntry) => {
      await expectRegistryEntryToEqualRawData(entry);
    }
  );
});

async function expectRegistryEntryToEqualRawData(
  entry: RegistryEntry,
  settings?: Partial<AppSettings>
) {
  const [ocr, trim] = await recognizeRegistryEntry(
    entry,
    settings ?? entry.settings
  );

  expect(ocr.rawData.grid).toEqual(entry.grid);
  expect(ocr.rawData.daemons).toEqual(entry.daemons);
  expect(ocr.rawData.bufferSize).toBe(entry.bufferSize);
  expect(trim.rawData).toBe(entry.bufferSize);
  expect(ocr.isValid).toBe(true);
  expect(trim.isValid).toBe(true);
}

async function recognizeRegistryEntry(
  entry: RegistryEntry,
  { downscaleSource, ...settings }: Partial<AppSettings> = {}
) {
  const file = join('./src/core/bp-registry', entry.path);
  const image = sharp(file);

  const container = await SharpImageContainer.create(image, {
    downscaleSource,
  });
  const extendedBufferSizeRecognitionRange =
    settings?.extendedBufferSizeRecognitionRange ?? false;
  const trimStrategy = new BreachProtocolBufferSizeTrimFragment(container, {
    extendedBufferSizeRecognitionRange,
    patch: '1.x',
  });
  const recognizer = new WasmBreachProtocolRecognizer(null);

  return Promise.all([
    breachProtocolOCR(container, recognizer, {
      patch: '1.x',
      thresholdGridAuto: true,
      thresholdTypesAuto: true,
      thresholdDaemonsAuto: true,
      thresholdBufferSizeAuto: true,
      skipTypesFragment: true,
      ...settings,
    }),
    // To not repeat tesseract ocr, trim strategy is running separately.
    trimStrategy.recognize(),
  ]);
}

// @ts-ignore
// Only test protected methods
class NoopImageContainer extends ImageContainer<any> {
  constructor(public readonly dimensions: Dimensions) {
    super();
  }

  // @ts-ignore
  toFragmentContainer(): FragmentContainer<any> {
    // Not used.
  }
}

class TestBreachProtocolRecognizer implements BreachProtocolRecognizer {
  lang: BreachProtocolLanguage = 'eng';
  // @ts-ignore
  async recognizeCode(): any {}
  // @ts-ignore
  async recognizeText(): any {}
}
