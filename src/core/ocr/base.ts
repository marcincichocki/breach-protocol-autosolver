import { chunk, getClosest, Point, unique } from '@/common';
import { createScheduler, createWorker } from 'tesseract.js';
import { BreachProtocolRawData, HexNumber, HEX_NUMBERS } from '../common';
import { ImageContainer } from './image-container';

export type FragmentId = keyof BreachProtocolRawData;

export interface BreachProtocolFragmentBoundingBox {
  width: number;
  height: number;
  left: number;
  top: number;
  outerWidth: number;
  outerHeight: number;
  innerWidth: number;
  innerHeight: number;
}

interface BreachProtocolFragmentResultBase {
  readonly boundingBox: BreachProtocolFragmentBoundingBox;
  readonly isValid: boolean;
  readonly id: FragmentId;
}

export interface BreachProtocolFragmentResult<TData, TSource>
  extends BreachProtocolFragmentResultBase {
  /** Threshold that was used to generate this result. */
  readonly threshold: number;

  /** Source of data. */
  readonly source: TSource;

  /** Extracted data from source. */
  readonly rawData: TData;

  /** Image that was used to get source from. */
  readonly fragment: Buffer;
}

export abstract class BreachProtocolFragment<TData, TSource, TImage> {
  /** Id of fragment. */
  abstract readonly id: FragmentId;

  /** Top left corner of fragment. */
  abstract readonly p1: Point;

  /** Botton right corner of fragment. */
  abstract readonly p2: Point;

  abstract readonly boundingBox: BreachProtocolFragmentBoundingBox;

  /** Preprocessed image fragment. */
  protected abstract readonly fragment: TImage;

  constructor(public readonly container: ImageContainer<TImage>) {}

  /** Recognize data from fragment image. */
  abstract recognize(
    threshold?: number
  ): Promise<BreachProtocolFragmentResult<TData, TSource>>;

  /** Check if recognized data is valid. */
  abstract isValid(data: TData): boolean;

  protected getBaseResultData(
    rawData: TData
  ): BreachProtocolFragmentResultBase {
    const { id, boundingBox } = this;
    const isValid = this.isValid(rawData);

    return {
      id,
      boundingBox,
      isValid,
    };
  }

  protected getFragmentBoundingBox() {
    const { p1, p2 } = this;
    const { width, height, left, top } = this.container.getCroppedBoundingBox();

    return {
      left: left + Math.round(p1.x * width),
      top: top + Math.round(p1.y * height),
      width: Math.round((p2.x - p1.x) * width),
      height: Math.round((p2.y - p1.y) * height),
      outerWidth: width + 2 * left,
      outerHeight: height + 2 * top,
      innerWidth: width,
      innerHeight: height,
    } as BreachProtocolFragmentBoundingBox;
  }
}

export abstract class BreachProtocolOCRFragment<
  TData,
  TImage
> extends BreachProtocolFragment<TData, Tesseract.Page, TImage> {
  // Tesseract may report mixed symbols on smaller resolutions.
  // This map contains some common errors.
  protected readonly correctionMap = new Map<string, HexNumber>([
    ['1E', '1C'],
    ['EB', 'E9'],
    ['F9', 'E9'],
    ['ED', 'BD'],
  ]);

  /** Map containing cropped heights and threshold values. */
  abstract readonly thresholds: Map<number, number>;

  constructor(public container: ImageContainer<TImage>) {
    super(container);

    // Initializing workers takes a lot of time. Loading them every time
    // when class is instantiated is a big performance bottleneck.
    // Instead call {@link BreachProtocolOCRFragment.initScheduler} during
    // bootstrap to init tesseract workers and
    // {@link BreachProtocolOCRFragment.terminateSchedulers} during exit
    // to terminated them.
    if (!BreachProtocolOCRFragment.scheduler) {
      throw new Error('Scheduler is not initialized!');
    }
  }

  protected abstract getRawData(lines: string[]): TData;

  private recognizeFragment(buffer: Buffer) {
    return BreachProtocolOCRFragment.scheduler.addJob(
      'recognize',
      buffer
    ) as Promise<Tesseract.RecognizeResult>;
  }

  async recognize(
    fixedThreshold?: number
  ): Promise<BreachProtocolFragmentResult<TData, Tesseract.Page>> {
    const threshold = fixedThreshold ?? this.getThreshold();
    const { data, buffer } = await this.ocr(threshold);
    const lines = this.getLines(data.text);
    const rawData = this.getRawData(lines);

    return {
      ...this.getBaseResultData(rawData),
      source: data,
      rawData,
      fragment: buffer,
      threshold,
    };
  }

  async ocr(threshold: number) {
    const fragment = this.container.threshold(this.fragment, threshold);
    const buffer = await this.container.toBuffer(fragment);
    const { data } = await this.recognizeFragment(buffer);

    return { data, buffer };
  }

  protected chunkLine(line: string) {
    // In some localizations font and font spacing is different. Sometimes
    // symbols are recognized without whitespaces which cause errors.
    // It's better to remove every whitespace character and then to chunk it.
    return chunk(line.replace(/\s/g, ''), 2);
  }

  protected amendSymbol(symbol: string) {
    if (this.correctionMap.has(symbol)) {
      return this.correctionMap.get(symbol);
    }

    return symbol as HexNumber;
  }

  protected parseLine(line: string) {
    return this.chunkLine(line).map((s) => this.amendSymbol(s));
  }

  protected getLines(text: string) {
    return text.split('\n').filter(Boolean);
  }

  protected validateSymbols(symbols: string[]) {
    if (!symbols.length) {
      // [].every(() => {}) returns true
      return false;
    }

    return symbols
      .filter(unique)
      .every((s) => HEX_NUMBERS.includes(s as HexNumber));
  }

  /** Get closest treshold value for given resolution. */
  protected getThreshold() {
    const { innerHeight } = this.boundingBox;
    const list = [...this.thresholds.keys()];
    const value = getClosest(innerHeight, list);

    return this.thresholds.get(value);
  }

  private static async initWorker() {
    const lang = 'BreachProtocol';
    const w = createWorker();

    await w.load();
    await w.loadLanguage(lang);
    await w.initialize(lang);
    await w.setParameters({
      tessedit_char_whitelist: HEX_NUMBERS.join(''),
    });

    return w;
  }

  static async initScheduler() {
    if (BreachProtocolOCRFragment.scheduler) {
      throw new Error('Scheduler is alredy initialized.');
    }

    const w1 = await BreachProtocolOCRFragment.initWorker();
    const w2 = await BreachProtocolOCRFragment.initWorker();

    const scheduler = createScheduler();

    scheduler.addWorker(w1);
    scheduler.addWorker(w2);

    BreachProtocolOCRFragment.scheduler = scheduler;
  }

  static terminateScheduler() {
    if (!BreachProtocolOCRFragment.scheduler) {
      throw new Error('Scheduler is not initialized.');
    }

    return BreachProtocolOCRFragment.scheduler.terminate();
  }

  static scheduler: Tesseract.Scheduler;
}
