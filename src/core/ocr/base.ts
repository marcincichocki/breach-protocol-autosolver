import { chunk, Point } from '@/common';
import sharp from 'sharp';
import { createScheduler, createWorker } from 'tesseract.js';
import { HexNumber, HEX_NUMBERS } from '../common';
import { FragmentId } from '../ocr';
import { ImageContainer } from './image-container';

export interface BreachProtocolFragmentBoundingBox extends sharp.Region {
  outerWidth: number;
  outerHeight: number;
}

export class BreachProtocolFragmentResult<R, T> {
  constructor(
    public readonly source: T,
    public readonly boundingBox: BreachProtocolFragmentBoundingBox,
    public readonly rawData: R
  ) {}
}

export abstract class BreachProtocolFragment2<R, T, I> {
  abstract readonly id: FragmentId;

  /** Top left corner of fragment. */
  abstract readonly p1: Point;

  /** Botton right corner of fragment. */
  abstract readonly p2: Point;

  /** 0-255 value of threshold. */
  abstract readonly threshold: number;

  constructor(
    public container: ImageContainer<I> // protected image: sharp.Sharp, // protected boundingBox: sharp.Region
  ) {}

  abstract recognize(): Promise<BreachProtocolFragmentResult<R, T>>;

  abstract isValid(data: R): boolean;

  protected getFragmentBoundingBox() {
    const { p1, p2 } = this;
    const fragmentBoundingBox = this.container.getCroppedBoundingBox();
    const { width, height, left, top } = fragmentBoundingBox;

    return {
      left: left + Math.round(p1.x * width),
      top: top + Math.round(p1.y * height),
      width: Math.round((p2.x - p1.x) * width),
      height: Math.round((p2.y - p1.y) * height),
      outerWidth: width + 2 * left,
      outerHeight: height + 2 * top,
    } as BreachProtocolFragmentBoundingBox;
  }
}

export abstract class BreachProtocolOCRFragment<
  R,
  T,
  I
> extends BreachProtocolFragment2<R, T, I> {
  protected readonly correctionMap = new Map<string, HexNumber>([
    ['1E', '1C'],
    ['EB', 'E9'],
    ['F9', 'E9'],
  ]);

  constructor(public container: ImageContainer<I>) {
    super(container);

    if (!BreachProtocolOCRFragment.scheduler) {
      throw new Error('Scheduler is not initialized!');
    }
  }

  async ocr() {
    const boundingBox = this.getFragmentBoundingBox();
    const fragment = await this.container.process(this.threshold, boundingBox);
    // const buffer = await fragment.clone().toBuffer();
    const buffer = await this.container.toBuffer(fragment);
    const { data } = await BreachProtocolOCRFragment.scheduler.addJob(
      'recognize',
      buffer
    );

    // TODO: return more stuff than just data?
    return { data, boundingBox, buffer };
  }

  /**
   * In some localizations font and font spacing is different. Sometimes
   * symbols are recognized without whitespaces which cause errors.
   *
   * It's better to remove every whitespace character and then to chunk it.
   *
   * @param line OCR line to chunk.
   * @returns Array of chunks.
   */
  protected chunkLine(line: string) {
    return chunk(line.replace(/\s/g, ''), 2);
  }

  /**
   * Try to ammend any OCR errors that are caused by custom
   * font used by some localizations.
   *
   * @param symbol Symbol to ammend.
   * @returns Correct symbol.
   */
  protected amendSymbol(symbol: string) {
    if (this.correctionMap.has(symbol)) {
      return this.correctionMap.get(symbol);
    }

    return symbol as HexNumber;
  }

  /**
   * Try to parse OCR line to remove any errors.
   *
   * @param line OCR line to parse.
   * @returns Chunked and corrected line.
   */
  protected parseLine(line: string) {
    return this.chunkLine(line).map((s) => this.amendSymbol(s));
  }

  protected getLines(text: string) {
    return text.split('\n').filter(Boolean);
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

export class BreachProtocolGridFragment<I> extends BreachProtocolOCRFragment<
  HexNumber[],
  Tesseract.Page,
  I
> {
  static worker: Tesseract.Worker;

  readonly id = 'grid';

  readonly p1 = new Point(0.137, 0.312);

  readonly p2 = new Point(0.383, 0.76);

  readonly threshold = 120;

  private getRawGrid(lines: string[]) {
    return lines.flatMap((l) => this.parseLine(l));
  }

  isValid() {
    // TODO: add validation
    return true;
  }

  async recognize() {
    const { data, buffer, boundingBox } = await this.ocr();
    const lines = this.getLines(data.text);
    const rawData = this.getRawGrid(lines);

    if (!this.isValid()) {
      throw new Error('grid is not valid');
    }

    return new BreachProtocolFragmentResult(data, boundingBox, rawData);
  }

  // TODO: getPositionSquareMap
}

export class BreachprotocolDaemonsFragment<I> extends BreachProtocolOCRFragment<
  HexNumber[][],
  Tesseract.Page,
  I
> {
  static worker: Tesseract.Worker;

  readonly id = 'daemons';

  readonly p1 = new Point(0.42, 0.312);

  readonly p2 = new Point(0.59, 0.76);

  // 4k 10
  readonly threshold = 45;

  protected getRawDaemons(lines: string[]) {
    return lines.map((l) => this.parseLine(l));
  }

  isValid() {
    // TODO
    return true;
  }

  async recognize() {
    const { data, buffer, boundingBox } = await this.ocr();
    const lines = this.getLines(data.text);
    const rawData = this.getRawDaemons(lines);

    if (!this.isValid()) {
      throw new Error('daemons are not valid');
    }

    return new BreachProtocolFragmentResult(data, boundingBox, rawData);
  }
}
