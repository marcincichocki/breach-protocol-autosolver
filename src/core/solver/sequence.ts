import { Serializable } from '@/common';
import { HexCode } from '../common';
import { Daemon } from './daemon';
import { HexCodeSequence } from './hex-code-sequence';

// interface will lose its index signature.
export type SequenceJSON = {
  value: HexCode[];
  parts: number[];
};

export class Sequence
  extends HexCodeSequence<HexCode[]>
  implements Serializable
{
  readonly indexes = this.parts.map((d) => d.index);

  /** List of indexes on which it is safe to break sequence. */
  readonly breaks = this.getSequenceBreaks();

  constructor(value: HexCode[], public readonly parts: Daemon[]) {
    super(value);
  }

  toJSON(): SequenceJSON {
    return {
      value: this.value,
      parts: this.parts.map((p) => p.index),
    };
  }

  // Sequence break is an index which doesn't have daemon attached.
  // For example daemons: FF 7A and BD BD can create sequence FF 7A BD BD.
  // At index 0 and 2 next daemon is not yet started and can be delayed if
  // buffer allows it.
  // It's not possible to break sequence on overlap. For example daemons:
  // FF 7A and 7A BD BD can not be broken on index 2 because they share
  // beginning and the end.
  private getSequenceBreaks() {
    return this.parts
      .map((d) => {
        const start = this.tValue.indexOf(d.tValue);
        const end = start + d.length - 1;

        return [start, end];
      })
      .filter(([s1], i, array) => {
        const prev = array[i - 1];
        const e2 = prev ? prev[1] : -1;

        return s1 > e2;
      })
      .map(([start]) => start);
  }
}
