import {
  Dimensions,
  FragmentContainer,
  FragmentContainerConfig,
  ImageContainer,
} from '@/core';
import sharp from 'sharp';
import { toBase64DataUri } from '../util';

export interface SharpImageContainerConfig {
  downscaleSource?: boolean;
}

class SharpFragmentContainer implements FragmentContainer<sharp.Sharp> {
  private readonly original = this.instance.clone();

  constructor(private readonly instance: sharp.Sharp) {}

  clone() {
    return new SharpFragmentContainer(this.original);
  }

  async toBase64({ trim }: { trim?: boolean } = {}) {
    const buffer = await this.instance.toBuffer();

    if (trim) {
      return this.trim(buffer);
    }

    const { width, height, format } = await this.instance.metadata();
    const data = buffer.toString('base64');
    const uri = toBase64DataUri(format, data);
    const dimensions = { width, height };

    return { uri, dimensions };
  }

  async toPixelData() {
    const { buffer, byteOffset, length } = await this.instance
      .clone()
      .raw()
      .toBuffer();

    return new Uint8Array(
      buffer,
      byteOffset,
      length / Uint8Array.BYTES_PER_ELEMENT
    );
  }

  threshold(threshold: number, grayscale = true) {
    this.instance.threshold(threshold, { grayscale });

    return this;
  }

  private async trim(buffer: Buffer) {
    try {
      const i1 = sharp(buffer);
      const buf = await i1.toBuffer();
      const i2 = sharp(buf);

      const m1 = await i1.metadata();
      const m2 = await i2.metadata();

      console.log({ m1, m2 });

      const {
        data: trimmedBuffer,
        info: { format, width, height },
      } = await i1.trim().toBuffer({ resolveWithObject: true });

      const data = trimmedBuffer.toString('base64');
      const uri = toBase64DataUri(format, data);
      const dimensions = { width, height };

      console.log(uri);

      return { uri, dimensions };
    } catch (err) {
      console.log(err);

      return {
        uri: toBase64DataUri('png', ''),
        dimensions: { width: 0, height: 0 },
      };
    }
  }
}

export class SharpImageContainer extends ImageContainer<sharp.Sharp> {
  // Only downscale from 4k or higher resolutions.
  static readonly MIN_DOWNSCALE_WIDTH = 3840;

  private constructor(
    public readonly instance: sharp.Sharp,
    public readonly dimensions: Dimensions,
    private readonly config: SharpImageContainerConfig
  ) {
    super();
  }

  static async create(
    instance: sharp.Sharp,
    config: SharpImageContainerConfig = {}
  ) {
    const { width, height } = await instance.metadata();

    return new SharpImageContainer(instance, { width, height }, config);
  }

  toFragmentContainer(config: FragmentContainerConfig) {
    const fragment = this.process(config);

    return new SharpFragmentContainer(fragment);
  }

  private process({
    boundingBox,
    colors,
    channel,
    flop,
    width,
    colorspace,
  }: FragmentContainerConfig) {
    const instance = this.instance.clone();

    instance
      .extract(boundingBox)
      .removeAlpha()
      .negate({ alpha: false })
      .toColorspace(colorspace ?? 'b-w');

    if (colors) {
      instance.png({ colors: colors, palette: false });
    }

    if (channel) {
      instance.extractChannel(channel);
    }

    if (flop) {
      instance.flop();
    }

    if (
      this.config.downscaleSource &&
      typeof width === 'number' &&
      boundingBox.innerWidth >= SharpImageContainer.MIN_DOWNSCALE_WIDTH
    ) {
      instance.resize({
        width,
        withoutEnlargement: true,
      });
    }

    return instance;
  }
}
