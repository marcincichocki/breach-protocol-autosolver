import { FragmentBoundingBox } from './fragments/fragment';

export interface Dimensions {
  width: number;
  height: number;
}

export interface FragmentContainerConfig {
  boundingBox: FragmentBoundingBox;
  colors?: number;
  channel?: string;
  flop?: boolean;
  width?: number;
}

export interface EncodedFragmentContainerResult {
  /** Base64 encoded string as data uri. */
  uri: string;

  /** Dimensions of encoded image. */
  dimensions: Dimensions;
}

export interface FragmentContainer<T> {
  /** Clones container with original image. */
  clone(): FragmentContainer<T>;

  /** Applies threshold transformation to fragment. */
  threshold(threshold: number, grayscale?: boolean): this;

  /** Returns fragment as base64 data uri. */
  toBase64(options?: {
    trim?: boolean;
  }): Promise<EncodedFragmentContainerResult>;

  /** Returns fragment as raw pixel data. */
  toPixelData(): Promise<Uint8Array>;
}

export abstract class ImageContainer<T> {
  /** Aspect ratio of breach protocol. */
  static readonly ASPECT_RATIO = 16 / 9;

  abstract readonly instance: T;

  abstract readonly dimensions: Dimensions;

  abstract toFragmentContainer(
    config: FragmentContainerConfig
  ): FragmentContainer<T>;

  /** Return aspect ratio for given resolution and handle edge cases. */
  getAspectRatio(x: number, y: number) {
    // WXGA, very close to 16:9
    // https://en.wikipedia.org/wiki/Graphics_display_resolution#WXGA
    if (y === 768 && (x === 1366 || x === 1360)) {
      return ImageContainer.ASPECT_RATIO;
    }

    return x / y;
  }

  getCroppedBoundingBox() {
    const { width: x, height: y } = this.dimensions;
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
