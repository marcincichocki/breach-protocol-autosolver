import sharp from 'sharp';

export abstract class ImageContainer<T> {
  readonly instance: T;

  readonly dimensions: { width: number; height: number };

  abstract process(threshold: number, fragmentBoundingBox: any): T;

  abstract toBuffer(instance: T): Promise<Buffer>;

  abstract toRawBuffer(instance: T): Promise<Buffer>;

  readonly BREACH_PROTOCOL_ASPECT_RATIO = 16 / 9;

  /** Return aspect ratio for given resolution and handle edge cases. */
  getAspectRatio(x: number, y: number) {
    // WXGA, very close to 16:9
    // TODO: test if this resolution correctly ocr buffer size.
    // https://en.wikipedia.org/wiki/Graphics_display_resolution#WXGA
    if (y === 768 && (x === 1366 || x === 1360)) {
      return this.BREACH_PROTOCOL_ASPECT_RATIO;
    }

    return x / y;
  }

  getCroppedBoundingBox() {
    const { width: x, height: y } = this.dimensions;
    // Resolution with ratio less than one have horizontal black
    // bars, and ratio greater than one have vertical.
    // Resolutions with ratio equal to 1 are in 16:9 aspect ratio
    // and do not require cropping.
    const ratio = this.getAspectRatio(x, y) / this.BREACH_PROTOCOL_ASPECT_RATIO;
    const width = ratio > 1 ? y * this.BREACH_PROTOCOL_ASPECT_RATIO : x;
    const height = ratio < 1 ? x / this.BREACH_PROTOCOL_ASPECT_RATIO : y;
    const left = (x - width) / 2;
    const top = (y - height) / 2;

    return { width, height, left, top };
  }
}

const SHARP_TOKEN = Symbol('SharpImageContainer');

export class SharpImageContainer extends ImageContainer<sharp.Sharp> {
  constructor(
    public readonly instance: sharp.Sharp,
    public readonly dimensions: { width: number; height: number },
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

    return new SharpImageContainer(instance, { width, height }, SHARP_TOKEN);
  }

  process(threshold: number, fragmentBoundingBox: any) {
    return this.instance
      .clone()
      .removeAlpha()
      .extract(fragmentBoundingBox)
      .threshold(threshold)
      .negate();
  }

  toBuffer(instance: sharp.Sharp) {
    return instance.toBuffer();
  }

  toRawBuffer(instance: sharp.Sharp) {
    return instance.raw().toBuffer();
  }
}
