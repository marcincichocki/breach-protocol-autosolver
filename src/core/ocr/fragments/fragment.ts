import { Point } from '@/common';

export enum FragmentId {
  Grid = 'grid',
  Daemons = 'daemons',
  Types = 'types',
  BufferSize = 'bufferSize',
}

export const FRAGMENTS = Object.values(FragmentId);

export interface Fragment {
  /** Id of fragment. */
  readonly id: FragmentId;

  /** Top left corner of fragment. */
  readonly p1: Point;

  /** Bottom right corner of fragment. */
  readonly p2: Point;

  /** Recognize data from fragment image. */
  recognize(threshold?: number): Promise<FragmentResult<unknown>>;

  /** Returns status of given fragment based on recognized data. */
  getStatus(rawData: unknown): FragmentStatus;
}

export interface BaseFragmentResult<TId extends FragmentId> {
  readonly boundingBox: FragmentBoundingBox;
  readonly id: TId;
  readonly isValid: boolean;
  readonly status: FragmentStatus;
}

export interface FragmentResult<TData, TId extends FragmentId = FragmentId>
  extends BaseFragmentResult<TId> {
  /** Used threshold to generate transformed image. */
  readonly threshold: number;

  /** Transformed image in base64 encoding. */
  readonly image: string;

  /** Extracted data from source. */
  readonly rawData: TData;
}

export enum FragmentStatus {
  Valid,
  InvalidSymbols,
  InvalidSize,
}

export interface FragmentBoundingBox {
  width: number;
  height: number;
  left: number;
  top: number;
  outerWidth: number;
  outerHeight: number;
  innerWidth: number;
  innerHeight: number;
}

export interface FragmentOptions {
  filterRecognizerResults?: boolean;
  extendedDaemonsAndTypesRecognitionRange?: boolean;
  extendedBufferSizeRecognitionRange?: boolean;
}
