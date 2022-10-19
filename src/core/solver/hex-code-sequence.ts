import { Cache } from '@/common';
import { fromHex, HexCode, toHex } from '../common';

export abstract class HexCodeSequence {
  /** Transformed value each hex code is a one character. */
  @Cache()
  get tValue() {
    return typeof this.input === 'string'
      ? this.input
      : HexCodeSequence.fromHex(this.input);
  }

  /** Raw value of in hex. */
  @Cache()
  get value() {
    return typeof this.input === 'string'
      ? HexCodeSequence.toHex(this.input)
      : this.input;
  }

  /** Length of hex codes. */
  readonly length = this.input.length;

  constructor(private readonly input: HexCode[] | string) {}

  static toHex(value: string) {
    return value.split('').map(toHex);
  }

  static fromHex(value: HexCode[]) {
    return value.map(fromHex).join('');
  }
}
