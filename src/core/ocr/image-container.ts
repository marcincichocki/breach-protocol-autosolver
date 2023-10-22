import { FragmentBoundingBox } from './fragments/fragment';

export interface Dimensions {
  width: number;
  height: number;
}

export interface FragmentContainerConfig {
  boundingBox: FragmentBoundingBox;
  colors?: number;
  channel?: 'red' | 'green' | 'blue';
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
  abstract readonly instance: T;

  abstract readonly dimensions: Dimensions;

  abstract toFragmentContainer(
    config: FragmentContainerConfig
  ): FragmentContainer<T>;
}
