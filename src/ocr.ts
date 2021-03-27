import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { Point } from './util';
import configs from './configs.json';
import {
  ROWS,
  COLS,
  cross,
  generateSquareMap,
  BreachProtocolRawData,
  validateRawData,
} from './common';

export type FragmentId = keyof BreachProtocolRawData;

export type Resolution = '1920x1080' | '2560x1440' | '3840x2160';

export interface BreachProtocolFragmentConfig {
  id: FragmentId;
  p1: Point;
  p2: Point;
  threshold: Record<Resolution, number>;
  whitelist: string[];
}

interface BreachProtocolFragmentBoundingBox extends sharp.Region {
  outerWidth: number;
  outerHeight: number;
}

class BreachProtocolFragmentOCRResult {
  /** Percentage that padding in buffer box takes. */
  private readonly padding = 0.00937;

  /** Percentage that buffer square takes. */
  private readonly square = 0.0164;

  /** Percentage that gap between buffer squares takes. */
  private readonly gap = 0.00546;

  constructor(
    public readonly id: FragmentId,
    public readonly data: Tesseract.Page,
    public readonly boundingBox: BreachProtocolFragmentBoundingBox,
    private rawBuffer: Buffer
  ) {}

  static toRawData(data: BreachProtocolFragmentOCRResult[]) {
    return data.reduce(
      (acc, d) =>
        Object.assign(acc, {
          [d.id]: d.toRawData(),
        }),
      {} as BreachProtocolRawData
    );
  }

  private getSizeOfBufferBox() {
    const step = 3; // rgb
    const rowLength = this.boundingBox.width * step;
    const row = this.rawBuffer.subarray(0, rowLength);
    let size = 0;

    for (let i = step - 1; i < row.length; i += step) {
      const isWhite = row.slice(i - 2, i).every((x) => x === 255);

      if (isWhite) {
        size += 1;
      }
    }

    return size;
  }

  private getBufferSizeFromPixels() {
    let size = this.getSizeOfBufferBox() / this.boundingBox.outerWidth;
    let bufferSize = 0;

    size -= 2 * this.padding;

    while (size > 0) {
      size -= this.square + this.gap;
      bufferSize += 1;
    }

    return bufferSize;
  }

  // TODO: add ocr strategy as fallback
  // NOTE: this strategy require diffrent threshold values!
  private getBufferSizeFromOCR(lines: string[]) {
    if (lines.length) {
      return lines.slice(-1)[0].replace(/\s/g, '').length;
    }
  }

  private getLines() {
    return this.data.text.split('\n').filter(Boolean);
  }

  private getRawGrid(lines: string[]) {
    return lines.flatMap((l) => l.split(' '));
  }

  private getRawSequences(lines: string[]) {
    return lines.map((l) => l.split(' '));
  }

  private getBufferSize() {
    return this.getBufferSizeFromPixels();
  }

  toRawData() {
    const lines = this.getLines();

    switch (this.id) {
      case 'grid':
        return this.getRawGrid(lines);
      case 'daemons':
        return this.getRawSequences(lines);
      case 'bufferSize':
        return this.getBufferSize();
      default: {
        throw new Error('Incorrect fragment id!');
      }
    }
  }
}

class BreachProtocolFragment {
  private isBufferSizeFragment = this.config.id === 'bufferSize';

  constructor(
    private readonly config: BreachProtocolFragmentConfig,
    private image: sharp.Sharp,
    public worker: Tesseract.Worker
  ) {}

  async ocr() {
    const { width, height } = await this.image.metadata();
    const threshold = this.getThreshold(width, height);
    const boundingBox = this.getBoundingBox(width, height);
    const fragment = await this.processImage(boundingBox, threshold);
    const buffer = await fragment.clone().toBuffer();
    const { data } = await this.worker.recognize(buffer);
    const rawBuffer = this.isBufferSizeFragment
      ? await fragment.clone().raw().toBuffer()
      : null;

    return new BreachProtocolFragmentOCRResult(
      this.config.id,
      data,
      boundingBox,
      rawBuffer
    );
  }

  private getThreshold(width: number, height: number) {
    const resolution = `${width}x${height}` as Resolution;
    const threshold = this.config.threshold[resolution];

    if (threshold == null) {
      throw new Error(`Unsuported resolution: ${resolution}`);
    }

    return threshold;
  }

  /**
   * Return bounding box of image fragment in pixels.
   */
  private getBoundingBox(width: number, height: number) {
    const { p1, p2 } = this.config;

    return {
      left: Math.round(p1.x * width),
      top: Math.round(p1.y * height),
      width: Math.round((p2.x - p1.x) * width),
      height: Math.round((p2.y - p1.y) * height),
      outerWidth: width,
      outerHeight: height,
    } as BreachProtocolFragmentBoundingBox;
  }

  private processImage(boundingBox: sharp.Region, threshold: number) {
    return this.image
      .removeAlpha()
      .extract(boundingBox)
      .threshold(threshold)
      .negate();
  }
}

async function createBreachProtocolWorker(lang: string, whitelist: string) {
  const w = createWorker();

  await w.load();
  await w.loadLanguage(lang);
  await w.initialize(lang);
  await w.setParameters({
    tessedit_char_whitelist: whitelist,
  });

  return w;
}

export async function loadWorkers(configs: BreachProtocolFragmentConfig[]) {
  const workers = {} as Record<FragmentId, Tesseract.Worker>;

  for (const config of configs) {
    const worker = await createBreachProtocolWorker(
      'BreachProtocol',
      config.whitelist.join('')
    );

    workers[config.id] = worker;
  }

  return workers;
}

function getPositionSquareMap({
  boundingBox,
  data,
}: BreachProtocolFragmentOCRResult) {
  const { top, left } = boundingBox;
  const lines = data.hocr.split('\n').filter((l) => l.includes('ocrx_word'));
  const size = Math.sqrt(lines.length);
  const squares = cross(ROWS.slice(0, size), COLS.slice(0, size));
  const bounds = lines
    .map((l) => l.match(/(?<=bbox )(\d|\s)*/g)[0])
    .map((l) => l.split(/\s/).map(Number));

  return generateSquareMap(squares, (s, i) => {
    const [x, y] = bounds[i];

    // this is top left corner of each square
    return new Point(x + left, y + top);
  });
}

export async function breachProtocolOCR(
  input: string | Buffer,
  workers: Record<FragmentId, Tesseract.Worker>
) {
  const image = sharp(input);
  const results = await Promise.all(
    (configs as BreachProtocolFragmentConfig[])
      .map((c) => new BreachProtocolFragment(c, image.clone(), workers[c.id]))
      .map((f) => f.ocr())
  );

  const rawData = BreachProtocolFragmentOCRResult.toRawData(results);

  validateRawData(rawData);

  const gridResult = results.find((r) => r.id === 'grid');
  const squarePositionMap = getPositionSquareMap(gridResult);

  return {
    squarePositionMap,
    rawData,
  };
}
