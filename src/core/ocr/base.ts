import { chunk, Point, unique } from '@/common';
import { createScheduler, createWorker } from 'tesseract.js';
import {
  BreachProtocolRawData,
  COLS,
  cross,
  generateSquareMap,
  HexNumber,
  HEX_NUMBERS,
  ROWS,
} from '../common';
import { FragmentId } from '../ocr';
import { BreachProtocolBufferSizeFragmentResult } from './buffer-size';
import { BreachProtocolDaemonsFragmentResult } from './daemons';
import { BreachProtocolGridFragmentResult } from './grid';
import { ImageContainer } from './image-container';

export interface BreachProtocolFragmentBoundingBox {
  width: number;
  height: number;
  left: number;
  top: number;
  outerWidth: number;
  outerHeight: number;
}

export class BreachProtocolFragmentResult<D, S, C> {
  constructor(
    public readonly source: S,
    public readonly boundingBox: BreachProtocolFragmentBoundingBox,
    public readonly rawData: D,
    public readonly fragment: C
  ) {}
}

export abstract class BreachProtocolFragment2<D, S, C> {
  /** Id of fragment. */
  abstract readonly id: FragmentId;

  /** Top left corner of fragment. */
  abstract readonly p1: Point;

  /** Botton right corner of fragment. */
  abstract readonly p2: Point;

  /** 0-255 value of threshold. */
  abstract readonly threshold: number;

  constructor(public container: ImageContainer<C>) {}

  /** Recognize data from fragment image. */
  abstract recognize(): Promise<BreachProtocolFragmentResult<D, S, C>>;

  /** Check if recognized data is valid. */
  abstract isValid(data: D): boolean;

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
    } as BreachProtocolFragmentBoundingBox;
  }
}

export abstract class BreachProtocolOCRFragment<
  D,
  S,
  C
> extends BreachProtocolFragment2<D, S, C> {
  // Tesseract may report mixed symbols on smaller resolutions.
  // This map contains some common errors.
  protected readonly correctionMap = new Map<string, HexNumber>([
    ['1E', '1C'],
    ['EB', 'E9'],
    ['F9', 'E9'],
  ]);

  constructor(public container: ImageContainer<C>) {
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

  private recognizeFragment(buffer: Buffer) {
    return BreachProtocolOCRFragment.scheduler.addJob(
      'recognize',
      buffer
    ) as Promise<Tesseract.RecognizeResult>;
  }

  async ocr() {
    const boundingBox = this.getFragmentBoundingBox();
    const fragment = await this.container.process(this.threshold, boundingBox);
    const buffer = await this.container.toBuffer(fragment);
    const { data } = await this.recognizeFragment(buffer);

    return { data, boundingBox, buffer, fragment };
  }

  /**
   * In some localizations font and font spacing is different. Sometimes
   * symbols are recognized without whitespaces which cause errors.
   *
   * It's better to remove every whitespace character and then to chunk it.
   */
  protected chunkLine(line: string) {
    return chunk(line.replace(/\s/g, ''), 2);
  }

  /**
   * Try to ammend any OCR errors that are caused by custom
   * font used by some localizations.
   */
  protected amendSymbol(symbol: string) {
    if (this.correctionMap.has(symbol)) {
      return this.correctionMap.get(symbol);
    }

    return symbol as HexNumber;
  }

  /** Try to parse OCR line to remove any errors. */
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

export class BreachProtocolRecognitionResult<I> {
  readonly positionSquareMap = this.getPositionSquareMap();

  readonly rawData = this.toRawData();

  constructor(
    public readonly grid: BreachProtocolGridFragmentResult<I>,
    public readonly daemons: BreachProtocolDaemonsFragmentResult<I>,
    public readonly bufferSize: BreachProtocolBufferSizeFragmentResult<I>
  ) {}

  toRawData(): BreachProtocolRawData {
    return {
      bufferSize: this.bufferSize.rawData,
      daemons: this.daemons.rawData,
      grid: this.grid.rawData,
    };
  }

  private getPositionSquareMap() {
    const { top, left } = this.grid.boundingBox;
    const lines = this.grid.source.hocr
      .split('\n')
      .filter((l) => l.includes('ocrx_word'));
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
}
