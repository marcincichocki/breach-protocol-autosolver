import { fromHex, HexCode } from '../common';

export abstract class HexCodeSequence<T extends HexCode[]> {
  readonly tValue = this.value.map(fromHex).join('');

  readonly length = this.value.length;

  constructor(public readonly value: T) {}
}
