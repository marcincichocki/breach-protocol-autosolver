import sharp from 'sharp';
import { BreachProtocolFragmentBoundingBox } from './base';

export abstract class ImageContainer<T> {
  readonly instance: T;

  readonly dimensions: { x: number; y: number };

  /** Crop image and turn it into 8bit. */
  abstract process(fragmentBoundingBox: BreachProtocolFragmentBoundingBox): T;

  abstract processGridFragment(
    fragmentBoundingBox: BreachProtocolFragmentBoundingBox
  ): T;

  abstract processDaemonsFragment(
    fragmentBoundingBox: BreachProtocolFragmentBoundingBox
  ): T;

  abstract processBufferSizeFragment(
    fragmentBoundingBox: BreachProtocolFragmentBoundingBox
  ): T;

  abstract trim(instance: T): Promise<{
    buffer: Buffer;
    width: number;
    height: number;
  }>;

  /** Apply threshold to given fragment. */
  abstract threshold(instance: T, threshold: number): T;

  abstract toBuffer(instance: T): Promise<Buffer>;

  abstract toRawBuffer(instance: T): Promise<Buffer>;

  abstract toFile(instance: T, fileName: string): Promise<unknown>;

  /** Aspect ratio of breach protocol. */
  static readonly ASPECT_RATIO = 16 / 9;

  /** Return aspect ratio for given resolution and handle edge cases. */
  getAspectRatio(x: number, y: number) {
    // WXGA, very close to 16:9
    // TODO: test if this resolution correctly ocr buffer size.
    // https://en.wikipedia.org/wiki/Graphics_display_resolution#WXGA
    if (y === 768 && (x === 1366 || x === 1360)) {
      return ImageContainer.ASPECT_RATIO;
    }

    return x / y;
  }

  getCroppedBoundingBox() {
    const { x, y } = this.dimensions;
    // Resolution with ratio less than one have horizontal black
    // bars, and ratio greater than one have vertical.
    // Resolutions with ratio equal to 1 are in 16:9 aspect ratio
    // and do not require cropping.
    const ratio = this.getAspectRatio(x, y) / ImageContainer.ASPECT_RATIO;
    const width = ratio > 1 ? y * ImageContainer.ASPECT_RATIO : x;
    const height = ratio < 1 ? x / ImageContainer.ASPECT_RATIO : y;
    const left = (x - width) / 2;
    const top = (y - height) / 2;

    return { width, height, left, top };
  }
}

const SHARP_TOKEN = Symbol('SharpImageContainer');

// NOTE: this class will not work in web environments!
export class SharpImageContainer extends ImageContainer<sharp.Sharp> {
  constructor(
    public readonly instance: sharp.Sharp,
    public readonly dimensions: { x: number; y: number },
    token?: Symbol
  ) {
    super();

    if (token !== SHARP_TOKEN) {
      throw new Error(
        'SharpImageContainer can not be created by constructor. Use SharpImageContainer.create instead.'
      );
    }
  }

  static async create(instance: sharp.Sharp) {
    const { width, height } = await instance.metadata();

    return new SharpImageContainer(
      instance,
      { x: width, y: height },
      SHARP_TOKEN
    );
  }

  process(fragmentBoundingBox: BreachProtocolFragmentBoundingBox) {
    return this.instance
      .clone()
      .removeAlpha()
      .extract(fragmentBoundingBox)
      .negate()
      .toColorspace('b-w');
  }

  processGridFragment(fragmentBoundingBox: BreachProtocolFragmentBoundingBox) {
    return this.process(fragmentBoundingBox);
  }

  processDaemonsFragment(
    fragmentBoundingBox: BreachProtocolFragmentBoundingBox
  ) {
    return this.process(fragmentBoundingBox);
  }

  processBufferSizeFragment(
    fragmentBoundingBox: BreachProtocolFragmentBoundingBox
  ) {
    return this.process(fragmentBoundingBox).flop();
  }

  async trim(instance: sharp.Sharp) {
    const buffer = await instance.toBuffer();
    const { data, info } = await sharp(buffer)
      .trim()
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: data,
      width: info.width,
      height: info.height,
    };
  }

  threshold(instance: sharp.Sharp, threshold: number) {
    return instance.clone().threshold(threshold);
  }

  toBuffer(instance: sharp.Sharp) {
    return instance.clone().toBuffer();
  }

  toRawBuffer(instance: sharp.Sharp) {
    return instance.clone().raw().toBuffer();
  }

  toFile(instance: sharp.Sharp, fileName: string) {
    return instance.clone().toFile(fileName);
  }
}
