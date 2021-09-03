import { BreachProtocolFragmentBoundingBox, ImageContainer } from '@/core';
import sharp from 'sharp';

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
      .toColorspace('b-w')
      .png({ colors: 2 });
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
