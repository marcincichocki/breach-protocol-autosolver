import { chunk, getClosest, Point, unique } from '@/common';
import {
  BreachProtocolRawData,
  BufferSize,
  BUFFER_SIZE_MAX,
  BUFFER_SIZE_MIN,
  HexNumber,
  HEX_NUMBERS,
} from '../common';
import { BreachProtocolBufferSizeFragmentResult } from './buffer-size';
import { BreachProtocolDaemonsFragmentResult } from './daemons';
import { BreachProtocolGridFragmentResult } from './grid';
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

export interface BreachProtocolSource {
  text: string;
  boxes: Tesseract.Bbox[];
}

export interface BreachProtocolRecognizer {
  recognize(image: Buffer): Promise<BreachProtocolSource>;
}

export enum BreachProtocolFragmentStatus {
  Valid,
  InvalidSymbols,
  InvalidSize,
}

interface BreachProtocolFragmentResultBase<TId extends FragmentId> {
  readonly boundingBox: BreachProtocolFragmentBoundingBox;
  readonly id: TId;
  readonly isValid: boolean;
  readonly status: BreachProtocolFragmentStatus;
}

export interface BreachProtocolFragmentResult<
  TData,
  TId extends FragmentId = FragmentId
> extends BreachProtocolFragmentResultBase<TId> {
  /** Used threshold to generate transformed image. */
  readonly threshold: number;

  /** Transformed image in base64 encoding. */
  readonly image: string;

  /** Extracted data from image. */
  readonly source: BreachProtocolSource;

  /** Extracted data from source. */
  readonly rawData: TData;
}

export type BreachProtocolFragmentResults = [
  BreachProtocolGridFragmentResult,
  BreachProtocolDaemonsFragmentResult,
  BreachProtocolBufferSizeFragmentResult
];

export abstract class BreachProtocolFragment<
  TData,
  TImage,
  TId extends FragmentId
> {
  /** Id of fragment. */
  abstract readonly id: TId;

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
  ): Promise<BreachProtocolFragmentResult<TData, TId>>;

  abstract getStatus(rawData: TData): BreachProtocolFragmentStatus;

  private getBaseResult(rawData: TData): BreachProtocolFragmentResultBase<TId> {
    const { id, boundingBox } = this;
    const status = this.getStatus(rawData);
    const isValid = status === BreachProtocolFragmentStatus.Valid;

    return {
      id,
      boundingBox,
      status,
      isValid,
    };
  }

  protected getFragmentResult(
    source: BreachProtocolSource,
    rawData: TData,
    buffer: Buffer,
    threshold: number
  ): BreachProtocolFragmentResult<TData, TId> {
    return {
      ...this.getBaseResult(rawData),
      source,
      rawData,
      image: buffer.toString('base64'),
      threshold,
    };
  }

  protected getFragmentBoundingBox() {
    const { p1, p2 } = this;
    const { width, height, left, top } = this.container.getCroppedBoundingBox();

    return {
      left: Math.round(p1.x * width + left),
      top: Math.round(p1.y * height + top),
      width: Math.round((p2.x - p1.x) * width),
      height: Math.round((p2.y - p1.y) * height),
      outerWidth: Math.round(2 * left + width),
      outerHeight: Math.round(2 * top + height),
      innerWidth: width,
      innerHeight: height,
    } as BreachProtocolFragmentBoundingBox;
  }
}

export abstract class BreachProtocolOCRFragment<
  TData,
  TImage,
  TId extends FragmentId
> extends BreachProtocolFragment<TData, TImage, TId> {
  // Tesseract may report mixed symbols on smaller resolutions.
  // This map contains some common errors.
  public static readonly correctionMap = new Map<string, HexNumber>([
    ['1E', '1C'],
    ['EE', '1C'],
    ['DE', '1C'],
    ['AC', '1C'],
    ['EB', 'E9'],
    ['F9', 'E9'],
    ['57', 'E9'],
    ['ED', 'BD'],
  ]);

  /** Map containing cropped heights and threshold values. */
  abstract readonly thresholds: Map<number, number>;

  constructor(
    container: ImageContainer<TImage>,
    private recognizer: BreachProtocolRecognizer
  ) {
    super(container);
  }

  protected abstract getRawData(lines: string[]): TData;

  async recognize(
    fixedThreshold?: number
  ): Promise<BreachProtocolFragmentResult<TData, TId>> {
    const threshold = fixedThreshold ?? this.getThreshold();
    const { source, buffer } = await this.ocr(threshold);
    const lines = this.getLines(source.text);
    const rawData = this.getRawData(lines);

    return this.getFragmentResult(source, rawData, buffer, threshold);
  }

  async ocr(threshold: number) {
    const fragment = this.container.threshold(this.fragment, threshold);
    const buffer = await this.container.toBuffer(fragment);
    const source = await this.recognizer.recognize(buffer);

    return { buffer, source };
  }

  protected chunkLine(line: string) {
    // In some localizations font and font spacing is different. Sometimes
    // symbols are recognized without whitespaces which cause errors.
    // It's better to remove every whitespace character and then to chunk it.
    return chunk(line.replace(/\s/g, ''), 2);
  }

  protected amendSymbol(symbol: string) {
    if (BreachProtocolOCRFragment.correctionMap.has(symbol)) {
      return BreachProtocolOCRFragment.correctionMap.get(symbol);
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
}

export abstract class BreachProtocolBufferSizeBase<
  TImage
> extends BreachProtocolFragment<BufferSize, TImage, 'bufferSize'> {
  readonly id = 'bufferSize';

  readonly p1 = new Point(0.42, 0.167);

  readonly p2 = new Point(0.8, 0.225);

  readonly boundingBox = this.getFragmentBoundingBox();

  readonly fragment = this.container.process(this.boundingBox);

  /** Percentage that padding in buffer box takes. */
  protected readonly padding = 0.00937;

  /** Percentage that buffer square takes. */
  protected readonly square = 0.0164;

  /** Percentage that gap between buffer squares takes. */
  protected readonly gap = 0.00546;

  getStatus(n: number) {
    if (!Number.isInteger(n) || n < BUFFER_SIZE_MIN || n > BUFFER_SIZE_MAX) {
      return BreachProtocolFragmentStatus.InvalidSize;
    }

    return BreachProtocolFragmentStatus.Valid;
  }
}
