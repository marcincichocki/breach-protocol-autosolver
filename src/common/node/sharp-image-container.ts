import { BreachProtocolFragmentBoundingBox, ImageContainer } from '@/core';
import sharp from 'sharp';

const SHARP_TOKEN = Symbol('SharpImageContainer');

export interface SharpImageContainerConfig {
  downscaleSource?: boolean;
}

// NOTE: this class will not work in web environments!
export class SharpImageContainer extends ImageContainer<sharp.Sharp> {
  // Only downscale from 4k or higher resolutions.
  static readonly MIN_DOWNSCALE_WIDTH = 3840;

  constructor(
    public readonly instance: sharp.Sharp,
    public readonly dimensions: { x: number; y: number },
    private readonly config: SharpImageContainerConfig,
    token?: Symbol
  ) {
    super();

    if (token !== SHARP_TOKEN) {
      throw new Error(
        'SharpImageContainer can not be created by constructor. Use SharpImageContainer.create instead.'
      );
    }
  }

  static async create(
    instance: sharp.Sharp,
    config: SharpImageContainerConfig = {}
  ) {
    const { width, height } = await instance.metadata();

    return new SharpImageContainer(
      instance,
      { x: width, y: height },
      config,
      SHARP_TOKEN
    );
  }

  process(fragmentBoundingBox: BreachProtocolFragmentBoundingBox) {
    return this.instance
      .clone()
      .extract(fragmentBoundingBox)
      .removeAlpha()
      .negate({ alpha: false })
      .toColorspace('b-w')
      .png({ colors: 2 });
  }

  processGridFragment(fragmentBoundingBox: BreachProtocolFragmentBoundingBox) {
    return this.processWithOptionalDownscaling(fragmentBoundingBox, 400);
  }

  processDaemonsFragment(
    fragmentBoundingBox: BreachProtocolFragmentBoundingBox
  ) {
    return this.processWithOptionalDownscaling(
      fragmentBoundingBox,
      450
    ).extractChannel('blue');
  }

  processTypesFragment(fragmentBoundingBox: BreachProtocolFragmentBoundingBox) {
    return this.process(fragmentBoundingBox).extractChannel('blue');
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

  threshold(instance: sharp.Sharp, threshold: number, grayscale = true) {
    return instance.clone().threshold(threshold, { grayscale });
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

  private processWithOptionalDownscaling(
    fragmentBoundingBox: BreachProtocolFragmentBoundingBox,
    width: number
  ) {
    const instance = this.process(fragmentBoundingBox);
    const isHighResolution =
      fragmentBoundingBox.innerWidth >= SharpImageContainer.MIN_DOWNSCALE_WIDTH;

    if (this.config.downscaleSource && isHighResolution) {
      return instance.resize({
        width,
        withoutEnlargement: true,
      });
    }

    return instance;
  }
}
