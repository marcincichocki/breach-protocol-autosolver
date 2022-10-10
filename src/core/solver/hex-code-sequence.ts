import { fromHex, HexCode } from '../common';

export abstract class HexCodeSequence<T extends HexCode[]> {
  /** Transformed value each hex code is a one character. */
  readonly tValue = this.value.map(fromHex).join('');

  /** Length of hex codes. */
  readonly length = this.value.length;

  constructor(public readonly value: T) {}
}
